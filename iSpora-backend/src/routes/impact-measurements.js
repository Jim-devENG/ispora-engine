const express = require('express');
const db = require('../database/connection');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get measurements for a specific metric
// @route   GET /api/impact/measurements/:metricId
// @access  Private
router.get('/:metricId', protect, async (req, res, next) => {
  try {
    const { metricId } = req.params;
    const { page = 1, limit = 20, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    // Verify metric belongs to user
    const metric = await db('impact_metrics').where({ id: metricId, user_id: req.user.id }).first();

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found',
      });
    }

    let query = db('impact_measurements').where({ metric_id: metricId });

    if (start_date) {
      query = query.where('measurement_date', '>=', new Date(start_date));
    }
    if (end_date) {
      query = query.where('measurement_date', '<=', new Date(end_date));
    }

    const measurements = await query
      .orderBy('measurement_date', 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    const totalCount = await db('impact_measurements')
      .where({ metric_id: metricId })
      .count('* as count')
      .first();

    res.status(200).json({
      success: true,
      count: measurements.length,
      total: parseInt(totalCount.count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount.count / limit),
      },
      data: measurements,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update measurement
// @route   PUT /api/impact/measurements/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const measurement = await db('impact_measurements as im')
      .select(['im.*', 'metric.user_id'])
      .join('impact_metrics as metric', 'im.metric_id', 'metric.id')
      .where('im.id', id)
      .andWhere('metric.user_id', req.user.id)
      .first();

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'Measurement not found',
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.metric_id;
    delete updateData.user_id;
    delete updateData.created_at;

    // Handle JSON fields
    if (updateData.context) {
      updateData.context = JSON.stringify(updateData.context);
    }
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    updateData.updated_at = new Date();

    await db('impact_measurements').where({ id }).update(updateData);

    const updatedMeasurement = await db('impact_measurements').where({ id }).first();

    res.status(200).json({
      success: true,
      message: 'Measurement updated successfully',
      data: updatedMeasurement,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete measurement
// @route   DELETE /api/impact/measurements/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const measurement = await db('impact_measurements as im')
      .select(['im.*', 'metric.user_id'])
      .join('impact_metrics as metric', 'im.metric_id', 'metric.id')
      .where('im.id', id)
      .andWhere('metric.user_id', req.user.id)
      .first();

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'Measurement not found',
      });
    }

    await db('impact_measurements').where({ id }).del();

    res.status(200).json({
      success: true,
      message: 'Measurement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify measurement
// @route   POST /api/impact/measurements/:id/verify
// @access  Private (Admin or metric owner)
router.post('/:id/verify', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verification_notes } = req.body;

    const measurement = await db('impact_measurements as im')
      .select(['im.*', 'metric.user_id'])
      .join('impact_metrics as metric', 'im.metric_id', 'metric.id')
      .where('im.id', id)
      .first();

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: 'Measurement not found',
      });
    }

    // Check if user can verify (owner or admin)
    if (measurement.user_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to verify this measurement',
      });
    }

    await db('impact_measurements').where({ id }).update({
      is_verified: true,
      verified_by: req.user.id,
      verified_at: new Date(),
      verification_notes,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Measurement verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get measurement statistics
// @route   GET /api/impact/measurements/:metricId/stats
// @access  Private
router.get('/:metricId/stats', protect, async (req, res, next) => {
  try {
    const { metricId } = req.params;

    // Verify metric belongs to user
    const metric = await db('impact_metrics').where({ id: metricId, user_id: req.user.id }).first();

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found',
      });
    }

    const [
      totalMeasurements,
      verifiedMeasurements,
      latestMeasurement,
      averageValue,
      minValue,
      maxValue,
      trendData,
    ] = await Promise.all([
      db('impact_measurements').where({ metric_id: metricId }).count('* as count').first(),
      db('impact_measurements')
        .where({ metric_id: metricId, is_verified: true })
        .count('* as count')
        .first(),
      db('impact_measurements')
        .where({ metric_id: metricId })
        .orderBy('measurement_date', 'desc')
        .first(),
      db('impact_measurements').where({ metric_id: metricId }).avg('value as avg').first(),
      db('impact_measurements').where({ metric_id: metricId }).min('value as min').first(),
      db('impact_measurements').where({ metric_id: metricId }).max('value as max').first(),
      db('impact_measurements')
        .select(['measurement_date', 'value'])
        .where({ metric_id: metricId })
        .orderBy('measurement_date', 'asc'),
    ]);

    const verificationRate =
      totalMeasurements.count > 0
        ? ((verifiedMeasurements.count / totalMeasurements.count) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        total_measurements: parseInt(totalMeasurements.count),
        verified_measurements: parseInt(verifiedMeasurements.count),
        verification_rate: parseFloat(verificationRate),
        latest_measurement: latestMeasurement,
        statistics: {
          average: parseFloat(averageValue.avg) || 0,
          minimum: parseFloat(minValue.min) || 0,
          maximum: parseFloat(maxValue.max) || 0,
        },
        trend_data: trendData,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk import measurements
// @route   POST /api/impact/measurements/bulk-import
// @access  Private
router.post('/bulk-import', protect, async (req, res, next) => {
  try {
    const { metric_id, measurements } = req.body;

    if (!metric_id || !measurements || !Array.isArray(measurements)) {
      return res.status(400).json({
        success: false,
        error: 'Metric ID and measurements array are required',
      });
    }

    // Verify metric belongs to user
    const metric = await db('impact_metrics')
      .where({ id: metric_id, user_id: req.user.id })
      .first();

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found',
      });
    }

    // Validate and prepare measurements
    const validMeasurements = measurements
      .filter((m) => m.value !== undefined && m.measurement_date)
      .map((m) => ({
        metric_id,
        user_id: req.user.id,
        value: m.value,
        unit: m.unit || metric.unit,
        measurement_date: m.measurement_date,
        data_source: m.data_source,
        collection_method: m.collection_method,
        notes: m.notes,
        confidence_level: m.confidence_level,
        data_quality: m.data_quality,
        is_estimate: m.is_estimate || false,
        margin_of_error: m.margin_of_error,
        context: JSON.stringify(m.context),
        tags: JSON.stringify(m.tags),
      }));

    if (validMeasurements.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid measurements found',
      });
    }

    // Insert measurements
    const insertedMeasurements = await db('impact_measurements')
      .insert(validMeasurements)
      .returning('*');

    res.status(201).json({
      success: true,
      message: `${insertedMeasurements.length} measurements imported successfully`,
      data: {
        imported_count: insertedMeasurements.length,
        total_provided: measurements.length,
        measurements: insertedMeasurements,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Export measurements
// @route   GET /api/impact/measurements/:metricId/export
// @access  Private
router.get('/:metricId/export', protect, async (req, res, next) => {
  try {
    const { metricId } = req.params;
    const { format = 'json', start_date, end_date } = req.query;

    // Verify metric belongs to user
    const metric = await db('impact_metrics').where({ id: metricId, user_id: req.user.id }).first();

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Metric not found',
      });
    }

    let query = db('impact_measurements').where({ metric_id: metricId });

    if (start_date) {
      query = query.where('measurement_date', '>=', new Date(start_date));
    }
    if (end_date) {
      query = query.where('measurement_date', '<=', new Date(end_date));
    }

    const measurements = await query.orderBy('measurement_date', 'asc');

    if (format === 'csv') {
      // Generate CSV format
      const csvHeader =
        'Date,Value,Unit,Data Source,Collection Method,Notes,Verified,Confidence Level,Data Quality\n';
      const csvRows = measurements
        .map(
          (m) =>
            `${m.measurement_date},${m.value},${m.unit || ''},${m.data_source || ''},${m.collection_method || ''},${m.notes || ''},${m.is_verified},${m.confidence_level || ''},${m.data_quality || ''}`,
        )
        .join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${metric.name}_measurements.csv"`,
      );
      res.send(csv);
    } else {
      // Return JSON format
      res.status(200).json({
        success: true,
        data: {
          metric: {
            id: metric.id,
            name: metric.name,
            description: metric.description,
            category: metric.category,
            unit: metric.unit,
          },
          measurements,
          export_info: {
            exported_at: new Date(),
            total_measurements: measurements.length,
            date_range: {
              start: start_date,
              end: end_date,
            },
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
