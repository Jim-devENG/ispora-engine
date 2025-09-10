import React from "react";
import {
  Target,
  ExternalLink,
  Clock,
  DollarSign,
  MapPin,
  Bookmark,
  TrendingUp,
  Users,
  GraduationCap,
  Briefcase,
  Rocket
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigation } from "./NavigationContext";

interface FeaturedOpportunity {
  id: string;
  title: string;
  type: 'scholarship' | 'job' | 'accelerator';
  company: string;
  amount?: {
    value: number;
    currency: string;
  };
  deadline: string;
  applicants: number;
  boost: number;
}

const featuredOpportunities: FeaturedOpportunity[] = [
  {
    id: "1",
    title: "Rhodes Scholarship for African Students",
    type: "scholarship",
    company: "University of Oxford",
    amount: {
      value: 50000,
      currency: "GBP"
    },
    deadline: "2026-10-01",
    applicants: 2847,
    boost: 156
  },
  {
    id: "2", 
    title: "Senior Software Engineer - Fintech",
    type: "job",
    company: "Stripe",
    amount: {
      value: 180000,
      currency: "USD"
    },
    deadline: "2026-08-15",
    applicants: 342,
    boost: 89
  },
  {
    id: "4",
    title: "TechStars Africa Accelerator Program",
    type: "accelerator", 
    company: "Techstars",
    amount: {
      value: 120000,
      currency: "USD"
    },
    deadline: "2026-09-30",
    applicants: 456,
    boost: 178
  }
];

export function FeaturedOpportunitiesWidget() {
  const { navigate } = useNavigation();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship':
        return <GraduationCap className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'accelerator':
        return <Rocket className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scholarship':
        return 'bg-blue-100 text-blue-700';
      case 'job':
        return 'bg-green-100 text-green-700';
      case 'accelerator':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatAmount = (amount: FeaturedOpportunity['amount']) => {
    if (!amount) return null;
    const value = amount.value >= 1000000 
      ? `${(amount.value / 1000000).toFixed(1)}M`
      : amount.value >= 1000 
      ? `${(amount.value / 1000).toFixed(0)}K`
      : amount.value.toString();
    return `${amount.currency} ${value}`;
  };

  const getUrgencyColor = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return "text-red-600";
    if (diffDays <= 30) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-[#021ff6]" />
            <CardTitle className="text-lg">Featured Opportunities</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('Opportunities')}
            className="text-[#021ff6] hover:text-[#021ff6]/80"
          >
            View All
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <CardDescription>
          Top opportunities boosted by the community
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {featuredOpportunities.map((opportunity) => (
          <div 
            key={opportunity.id}
            className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer"
            onClick={() => navigate('Opportunities')}
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getTypeColor(opportunity.type)} variant="secondary">
                      {getTypeIcon(opportunity.type)}
                      <span className="ml-1 capitalize">{opportunity.type}</span>
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-[#021ff6]">
                      <TrendingUp className="h-3 w-3" />
                      <span>{opportunity.boost} boosts</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2 hover:text-[#021ff6] transition-colors">
                    {opportunity.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{opportunity.company}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Bookmark className="h-3 w-3" />
                </Button>
              </div>

              {/* Details */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  {opportunity.amount && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatAmount(opportunity.amount)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{opportunity.applicants}</span>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 ${getUrgencyColor(opportunity.deadline)}`}>
                  <Clock className="h-3 w-3" />
                  <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Call to Action */}
        <div className="pt-2 border-t border-gray-100">
          <Button 
            onClick={() => navigate('Opportunities')}
            className="w-full bg-[#021ff6] hover:bg-[#021ff6]/90"
            size="sm"
          >
            <Target className="h-4 w-4 mr-2" />
            Explore All Opportunities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
