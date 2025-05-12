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
  const initializeProfile = useProfileStore(state => state.initializeProfileForUser);

  const [isNominateRewardOpen, setIsNominateRewardOpen] = React.useState(false);

  React.useEffect(() => {
    if (user && (!profileData || profileData.personal.companyEmail !== user.email)) {
      initializeProfile(user);
    }
  }, [user, profileData, initializeProfile]);

  if (authLoading || !user || !profileData || !profileData.rewards || !profileData.personal) {
    return <div>Loading rewards...</div>;
  }

  const handleNominateRewardSubmit = (data) => {
    const currentRewards = profileData.rewards;
    const pointsToShare = parseInt(data.points, 10);
    const remainingSharable = (currentRewards.sharablePointsMonthlyLimit || 0) - (currentRewards.pointsSharedThisMonth || 0);

    if (pointsToShare > remainingSharable) {
         toast({ 
            title: "Nomination Failed", 
            description: `You only have ${remainingSharable} points left to share this month.`,
            variant: "destructive"
        });
        return;
    }

    addNominationInStore({
        nominee: data.nominee, 
        points: pointsToShare,
        reasonCategory: data.reasonCategory,
        feedbackText: data.feedbackText,
    });
    toast({ title: "Nomination Submitted", description: `You have nominated ${data.nominee} for ${pointsToShare} points.` });
    setIsNominateRewardOpen(false);
  };
  
  const availableEmployeesForNomination = DUMMY_EMPLOYEE_LIST_FOR_NOMINATION
    .filter(emp => emp.name !== user.name) 
    .map(e => e.name); 
  
  const rewardsData = profileData.rewards;
  const personalData = profileData.personal;
  const sharablePointsBalance = (rewardsData.sharablePointsMonthlyLimit || 0) - (rewardsData.pointsSharedThisMonth || 0);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><Award /> Reward Zone</CardTitle>
          <CardDescription>View your reward points, nominate colleagues, and manage your rewards activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-semibold mb-1">Welcome, {personalData.name}!</h3>
            <p className="text-2xl font-bold text-primary">{rewardsData.accruedPoints || 0} <span className="text-sm font-normal text-muted-foreground">Accrued Points</span></p>
             <p className="text-sm text-muted-foreground mt-1">
                You can share <strong>{sharablePointsBalance} / {rewardsData.sharablePointsMonthlyLimit || 0}</strong> points this month.
            </p>
          </div>

          <Tabs defaultValue="my_nominations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my_nominations">My Nominations</TabsTrigger>
              <TabsTrigger value="received_rewards">Rewards Received</TabsTrigger>
              <TabsTrigger value="reward_someone">Reward Someone</TabsTrigger>
            </TabsList>

            <TabsContent value="my_nominations" className="pt-6">
              <h3 className="font-semibold mb-3 text-xl">My Earlier Nominations</h3>
              {rewardsData.nominationHistoryGiven?.length > 0 ? (
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
               {rewardsData.nominationHistoryReceived?.length > 0 ? (
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
              <h3 className="font-semibold mb-1 text-xl">Reward Someone</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Recognize a colleague for their outstanding work. 
                You have <strong>{sharablePointsBalance}</strong> points available to share this month.
              </p>
              <Button onClick={() => setIsNominateRewardOpen(true)} disabled={sharablePointsBalance <= 0}>
                <Gift className="mr-2 h-4 w-4" /> 
                {sharablePointsBalance <= 0 ? "No Points to Share" : "Nominate Colleague"}
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 p-3 border-t text-xs text-muted-foreground">
            <p><strong>NOTE:</strong></p>
            <ul className="list-disc list-inside ml-4">
                <li>Rewards that you can share ({rewardsData.sharablePointsMonthlyLimit || 0} points) will reset on the 1st of every month.</li>
                <li>However, rewards you have collected (Accrued Points) will remain intact.</li>
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
        availablePointsToShare={sharablePointsBalance}
      />
    </div>
  );
}

