
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NominateRewardDialog } from "@/components/profile/nominate-reward-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMockAuth } from "@/hooks/use-mock-auth";
import { Award, Gift } from "lucide-react";

// Mock data relevant to this page - Indian context
const mockRewardsData = {
  pointsAvailable: 1250,
  pointsReceived: 500,
  pointsValue: "₹ 125.00", // Assuming 1 point = ₹0.10
  nominationHistory: [
    { id: 1, to: "Rohan Mehra", points: 100, date: "2024-06-15", approvedBy: "Priya Sharma", approvedOn: "2024-06-16", reason: "Excellent project management on HRMS portal." },
    { id: 2, to: "Aisha Khan", points: 50, date: "2024-05-20", approvedBy: "Priya Sharma", approvedOn: "2024-05-21", reason: "Great teamwork and UI designs for Q2." },
  ],
};

const DUMMY_EMPLOYEE_LIST = [ // Updated with Indian names
  { name: "Priya Sharma" }, { name: "Rohan Mehra" }, { name: "Aisha Khan" },
  { name: "Vikram Singh" }, { name: "Suresh Kumar" }, { name: "Sunita Reddy" },
  { name: "Arjun Patel" }, { name: "Meera Iyer" }, { name: "Imran Ahmed" }, { name: "Deepika Rao" },
];


export default function RewardsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useMockAuth();
  const [isNominateRewardOpen, setIsNominateRewardOpen] = React.useState(false);

  if (authLoading || !user) {
    return <div>Loading rewards...</div>;
  }

  const handleNominateReward = (data) => {
    console.log("Reward nomination:", data);
    // Add to mockRewardsData.nominationHistory or call an API
    toast({ title: "Nomination Submitted", description: `You have nominated ${data.nominee} for ${data.points} points.` });
    setIsNominateRewardOpen(false);
  };
  
  const availableEmployeesForNomination = DUMMY_EMPLOYEE_LIST
    .map(e => e.name)
    .filter(name => name !== user.name);

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
                  <CardTitle className="text-3xl">{mockRewardsData.pointsAvailable}</CardTitle>
                  <CardDescription>Points Available</CardDescription>
                </Card>
                <Card className="pt-6 pb-4">
                  <CardTitle className="text-3xl">{mockRewardsData.pointsReceived}</CardTitle>
                  <CardDescription>Points Received (Lifetime)</CardDescription>
                </Card>
                <Card className="pt-6 pb-4">
                  <CardTitle className="text-3xl">{mockRewardsData.pointsValue}</CardTitle>
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
              {mockRewardsData.nominationHistory.length > 0 ? (
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
                    {mockRewardsData.nominationHistory.map(item => (
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
