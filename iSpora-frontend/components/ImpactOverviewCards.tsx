import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, FolderOpen, Star, UserCheck, CheckCircle, Clock, UserPlus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
}

function MetricCard({ title, value, subtitle, icon, iconColor }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-4 w-4 ${iconColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ProjectsContributedCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Projects Contributed</CardTitle>
        <div className="h-4 w-4 text-green-600">
          <FolderOpen className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Ongoing Projects */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">ongoing</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            {/* Completed Projects */}
            <div className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <div className="text-lg font-semibold text-green-700">5</div>
              </div>
              <p className="text-xs text-muted-foreground">completed</p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total: 7 projects</span>
              <span>71% completion rate</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: '71%' }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MentorshipSessionsCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Mentorship Sessions</CardTitle>
        <div className="h-4 w-4 text-blue-600">
          <Users className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Ongoing Sessions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <div className="text-2xl font-bold">3</div>
              </div>
              <p className="text-xs text-muted-foreground">ongoing</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            {/* Completed Sessions */}
            <div className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <CheckCircle className="h-3 w-3 text-blue-500" />
                <div className="text-lg font-semibold text-blue-700">12</div>
              </div>
              <p className="text-xs text-muted-foreground">completed</p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total: 15 sessions</span>
              <span>80% completion rate</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: '80%' }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MenteesReachedCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Mentees Reached</CardTitle>
        <div className="h-4 w-4 text-orange-600">
          <UserCheck className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Mentees Reached */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1">
                <UserCheck className="h-3 w-3 text-orange-500" />
                <div className="text-2xl font-bold">24</div>
              </div>
              <p className="text-xs text-muted-foreground">reached</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            {/* Pending Requests */}
            <div className="text-right">
              <div className="flex items-center justify-end space-x-1">
                <UserPlus className="h-3 w-3 text-orange-500" />
                <div className="text-lg font-semibold text-orange-700">8</div>
              </div>
              <p className="text-xs text-muted-foreground">requests</p>
            </div>
          </div>
          
          {/* Summary */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total: 32 mentees</span>
              <span>75% engaged</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ImpactOverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Projects Contributed card - First position */}
      <ProjectsContributedCard />
      
      {/* Mentorship Sessions card - Second position */}
      <MentorshipSessionsCard />
      
      {/* Mentees Reached card - Third position */}
      <MenteesReachedCard />
      
      {/* Credits Earned card - Fourth position */}
      <MetricCard
        title="Credits Earned"
        value={180}
        subtitle="total credits"
        icon={<Star className="h-4 w-4" />}
        iconColor="text-yellow-600"
      />
    </div>
  );
}
