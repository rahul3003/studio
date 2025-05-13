"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NominateRewardDialog } from "@/components/profile/nominate-reward-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore, DUMMY_EMPLOYEE_LIST_FOR_NOMINATION, REWARD_REASON_CATEGORIES } from "@/store/profileStore";
import { Award, Gift, Users, CalendarDays, CheckCircle, Edit } from "lucide-react";

export default function RewardsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthStore();
  const profileData = useProfileStore((state) => state.profileData);
  const addNominationInStore = useProfileStore((state) => state.addNomination);

  const [isNominateRewardOpen, setIsNominateRewardOpen] = React.useState(false);

  if (authLoading || !user || !profileData || !profileData.rewards || !profileData.personal) {
    return <div>Loading rewards...</div>;
  }

  const handleNominateRewardSubmit = (data) => {
    // Validation for points (integer, multiple of 5) is in the dialog's Zod schema
    // Additional check for available points is also in the store's addNomination
    addNominationInStore({
        nominee: data.nominee, 
        points: parseInt(data.points, 10), // Ensure it's a number
        reasonCategory: data.reasonCategory,
        feedbackText: data.feedbackText,
    });
    toast({ title: "Nomination Submitted", description: `You have nominated ${data.nominee} for ${data.points} points.` });
    setIsNominateRewardOpen(false);
  };
  
  const availableEmployeesForNomination = DUMMY_EMPLOYEE_LIST_FOR_NOMINATION
    .filter(emp => emp.name !== user.name) 
    .map(e => e.name); 
  
  const rewardsData = profileData.rewards;
  const personalData = profileData.personal;

  const pointsLeftThisMonth = Math.max(0, (rewardsData.monthlyShareLimit || 0) - (rewardsData.pointsSharedThisMonth || 0));
  const pointsLeftThisYear = Math.max(0, (rewardsData.totalAnnualSharablePoints || 0) - (rewardsData.pointsSharedThisYear || 0));
  const actualAvailablePointsToShare = Math.min(pointsLeftThisMonth, pointsLeftThisYear);
  
  const yearlySharableBalanceDisplay = `${pointsLeftThisYear} / ${rewardsData.totalAnnualSharablePoints || 0}`;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl"><Award /> Reward Zone</CardTitle>
            <CardDescription>View your reward points, nominate colleagues, and manage your rewards activity.</CardDescription>
          </div>
          <Button 
            onClick={() => setIsNominateRewardOpen(true)} 
            disabled={actualAvailablePointsToShare <= 0}
            className="h-10"
          >
            <Gift className="mr-2 h-4 w-4" /> 
            {actualAvailablePointsToShare <= 0 ? "No Points to Share" : "Reward Colleague"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-1">Balance Overview</h3>
                <p className="text-2xl font-bold text-primary">{rewardsData.accruedPoints || 0} <span className="text-sm font-normal text-muted-foreground">Points Balance</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Available to share: <strong>{yearlySharableBalanceDisplay}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Monthly limit: <strong>{rewardsData.monthlyShareLimit || 0}</strong> points
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="my_nominations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my_nominations">My Nominations</TabsTrigger>
              <TabsTrigger value="received_rewards">Rewards Received</TabsTrigger>
              <TabsTrigger value="reward_someone">Reward Someone</TabsTrigger>
            </TabsList>

            <TabsContent value="my_nominations" className="pt-6">
              <h3 className="font-semibold mb-3 text-xl">My Earlier Nominations</h3>
              {(rewardsData.nominationHistoryGiven || []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>To (Nominee)</TableHead>
                      <TableHead>Points Shared</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason Category</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardsData.nominationHistoryGiven.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nomineeName}</TableCell>
                        <TableCell>{item.points}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{item.reasonCategory}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.feedbackText}>{item.feedbackText}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (<p className="text-sm text-muted-foreground">You haven't nominated anyone yet.</p>)}
            </TabsContent>

            <TabsContent value="received_rewards" className="pt-6">
              <h3 className="font-semibold mb-3 text-xl">Rewards I Received</h3>
               {(rewardsData.nominationHistoryReceived || []).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From (Nominator)</TableHead>
                      <TableHead>Points Received</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Equivalent Cash</TableHead>
                      <TableHead>Reason Category</TableHead>
                       <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardsData.nominationHistoryReceived.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nominatorName}</TableCell>
                        <TableCell>{item.points}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>₹ {(item.points * 200).toLocaleString('en-IN')}</TableCell>
                        <TableCell>{item.reasonCategory}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.feedbackText}>{item.feedbackText}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (<p className="text-sm text-muted-foreground">You haven't received any rewards yet.</p>)}
            </TabsContent>

            <TabsContent value="reward_someone" className="pt-6">
              <div className="flex justify-start mb-4">
                <Button 
                  onClick={() => setIsNominateRewardOpen(true)} 
                  disabled={actualAvailablePointsToShare <= 0}
                  className="h-10"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  {actualAvailablePointsToShare <= 0 ? "No Points to Share" : "Reward Colleague"}
                </Button>
              </div>
              <h3 className="font-semibold mb-1 text-xl">Reward Someone</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Recognize a colleague for their outstanding work. 
                You have <strong>{actualAvailablePointsToShare}</strong> points available to share.
                (Max {rewardsData.monthlyShareLimit} this month, {pointsLeftThisYear} left for the year).
              </p>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 p-3 border-t text-xs text-muted-foreground">
            <p><strong>NOTE:</strong></p>
            <ul className="list-disc list-inside ml-4">
                <li>Your total annual sharable points ({rewardsData.totalAnnualSharablePoints || 0}) are calculated based on your joining date for the current calendar year.</li>
                <li>Your capacity to share points resets up to {rewardsData.monthlyShareLimit || 0} points on the 1st of every month (if your annual balance allows).</li>
                <li>Points you have accrued by receiving rewards from others will remain intact.</li>
            </ul>
          </div>

        </CardContent>
      </Card>
      <NominateRewardDialog 
        isOpen={isNominateRewardOpen} 
        onClose={() => setIsNominateRewardOpen(false)} 
        onSubmit={handleNominateRewardSubmit} 
        employeeList={availableEmployeesForNomination}
        rewardCategories={REWARD_REASON_CATEGORIES}
        currentUser={user?.name || "Current User"}
        availablePointsToShare={actualAvailablePointsToShare}
      />
    </div>
  );
}

