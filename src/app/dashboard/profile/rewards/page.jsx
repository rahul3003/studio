"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // CardFooter removed
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NominateRewardDialog } from "@/components/profile/nominate-reward-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore, DUMMY_EMPLOYEE_LIST_FOR_NOMINATION } from "@/store/profileStore";
import { Award, Gift } from "lucide-react";


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

  if (authLoading || !user || !profileData || !profileData.rewards) {
    return <div>Loading rewards...</div>;
  }

  const handleNominateReward = (data) => {
    const newNomination = {
        to: data.nominee,
        points: data.points,
        date: new Date().toISOString().split('T')[0],
        approvedBy: user.name,
        approvedOn: new Date().toISOString().split('T')[0],
        reason: data.reason,
    };
    addNominationInStore(newNomination);
    toast({ title: "Nomination Submitted", description: `You have nominated ${data.nominee} for ${data.points} points.` });
    setIsNominateRewardOpen(false);
  };
  
  const availableEmployeesForNomination = DUMMY_EMPLOYEE_LIST_FOR_NOMINATION
    .map(e => e.name)
    .filter(name => name !== user.name);
  
  const rewardsData = profileData.rewards;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl"><Award /> Rewards Program</CardTitle>
          <CardDescription>View your reward points, nominate colleagues, and see your nomination history.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="my_rewards">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my_rewards">My Rewards</TabsTrigger>
              <TabsTrigger value="nominate">Nominate</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="my_rewards" className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <Card className="pt-6 pb-4">
                  <CardTitle className="text-3xl">{rewardsData.pointsAvailable}</CardTitle>
                  <CardDescription>Points Available</CardDescription>
                </Card>
                <Card className="pt-6 pb-4">
                  <CardTitle className="text-3xl">{rewardsData.pointsReceived}</CardTitle>
                  <CardDescription>Points Received (Lifetime)</CardDescription>
                </Card>
                <Card className="pt-6 pb-4">
                  <CardTitle className="text-3xl">{rewardsData.pointsValue}</CardTitle>
                  <CardDescription>Approx. Value</CardDescription>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="nominate" className="pt-6">
              <p className="text-sm text-muted-foreground mb-3">Recognize a colleague for their outstanding work.</p>
              <Button onClick={() => setIsNominateRewardOpen(true)}><Gift className="mr-2 h-4 w-4" /> Nominate Someone</Button>
            </TabsContent>
            <TabsContent value="history" className="pt-6">
              <h3 className="font-semibold mb-2 text-lg">My Nomination History:</h3>
              {rewardsData.nominationHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>To</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewardsData.nominationHistory.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.to}</TableCell>
                        <TableCell>{item.points}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.reason}>{item.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (<p className="text-sm text-muted-foreground">You haven't nominated anyone yet.</p>)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <NominateRewardDialog isOpen={isNominateRewardOpen} onClose={() => setIsNominateRewardOpen(false)} onSubmit={handleNominateReward} employeeList={availableEmployeesForNomination} />
    </div>
  );
}
