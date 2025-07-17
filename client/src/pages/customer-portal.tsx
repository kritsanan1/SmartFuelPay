import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { User, CreditCard, History, Award, Star, Calendar, Bell, Gift } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Transaction } from "@shared/schema";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  totalLiters: number;
  joinDate: string;
  loyaltyPoints: number;
  tier: string;
  favoriteStation: string;
}

interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: "discount" | "free_fuel" | "service";
  value: number;
}

export default function CustomerPortal() {
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("30days");
  const queryClient = useQueryClient();

  // Mock customer data - in real app would come from authentication
  const customer: CustomerProfile = {
    id: "CUST001",
    name: "สมชาย ใจดี",
    email: "somchai@email.com",
    phone: "+66 81 234 5678",
    totalSpent: 15420,
    totalLiters: 435.2,
    joinDate: "2023-06-15",
    loyaltyPoints: 1542,
    tier: "Gold",
    favoriteStation: "Station 03"
  };

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/customer/transactions", customer.id],
  });

  const { data: loyaltyRewards = [] } = useQuery<LoyaltyReward[]>({
    queryKey: ["/api/customer/rewards"],
  });

  const redeemRewardMutation = useMutation({
    mutationFn: (rewardId: string) => apiRequest("/api/customer/redeem-reward", "POST", { rewardId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/transactions"] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<CustomerProfile>) => 
      apiRequest("/api/customer/profile", "PUT", profileData),
  });

  const mockRewards: LoyaltyReward[] = [
    {
      id: "RW001",
      title: "5% Fuel Discount",
      description: "Get 5% off your next fuel purchase",
      pointsCost: 500,
      type: "discount",
      value: 5
    },
    {
      id: "RW002", 
      title: "Free Car Wash",
      description: "Complimentary premium car wash service",
      pointsCost: 800,
      type: "service",
      value: 150
    },
    {
      id: "RW003",
      title: "Free 10L Fuel",
      description: "10 liters of free fuel (any grade)",
      pointsCost: 1200,
      type: "free_fuel",
      value: 350
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "bg-amber-600";
      case "Silver": return "bg-gray-400";
      case "Gold": return "bg-yellow-500";
      case "Platinum": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getTierProgress = (points: number) => {
    const tiers = { Bronze: 0, Silver: 1000, Gold: 2500, Platinum: 5000 };
    const currentTier = customer.tier as keyof typeof tiers;
    const nextTierNames = { Bronze: "Silver", Silver: "Gold", Gold: "Platinum", Platinum: "Diamond" };
    const nextTier = nextTierNames[currentTier];
    
    if (!nextTier) return { progress: 100, pointsNeeded: 0, nextTier: "Max Level" };
    
    const currentThreshold = tiers[currentTier];
    const nextThreshold = tiers[nextTier as keyof typeof tiers] || 10000;
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    const pointsNeeded = nextThreshold - points;
    
    return { progress: Math.min(progress, 100), pointsNeeded: Math.max(pointsNeeded, 0), nextTier };
  };

  const { progress, pointsNeeded, nextTier } = getTierProgress(customer.loyaltyPoints);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ยินดีต้อนรับ {customer.name}</h1>
            <p className="text-gray-600 dark:text-gray-300">จัดการบัญชีและประวัติการใช้บริการ</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getTierColor(customer.tier)} text-white`}>
              <Star className="w-3 h-3 mr-1" />
              {customer.tier} Member
            </Badge>
            <span className="text-lg font-semibold">{customer.loyaltyPoints.toLocaleString()} แต้ม</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ยอดใช้จ่ายทั้งหมด</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{customer.totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">ตั้งแต่สมัครสมาชิก</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">น้ำมันที่ใช้</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.totalLiters.toLocaleString()}L</div>
              <p className="text-xs text-muted-foreground">ปริมาณรวม</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แต้มสะสม</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customer.loyaltyPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">ใช้แลกรางวัลได้</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">วันที่สมัคร</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(customer.joinDate), 'dd/MM/yyyy')}
              </div>
              <p className="text-xs text-muted-foreground">สมาชิกมา {Math.floor((new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 60 * 60 * 24))} วัน</p>
            </CardContent>
          </Card>
        </div>

        {/* Loyalty Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>สถานะสมาชิก</CardTitle>
            <CardDescription>ความก้าวหน้าสู่ระดับถัดไป</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{customer.tier}</span>
                <span className="text-sm text-gray-600">{nextTier}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-gray-600">
                <span>{customer.loyaltyPoints.toLocaleString()} แต้ม</span>
                {pointsNeeded > 0 && <span>อีก {pointsNeeded.toLocaleString()} แต้ม</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">ประวัติการใช้</TabsTrigger>
            <TabsTrigger value="rewards">แลกรางวัล</TabsTrigger>
            <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
            <TabsTrigger value="notifications">การแจ้งเตือน</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>ประวัติการทำรายการ</CardTitle>
                    <CardDescription>รายการใช้บริการทั้งหมด</CardDescription>
                  </div>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 วันล่าสุด</SelectItem>
                      <SelectItem value="30days">30 วันล่าสุด</SelectItem>
                      <SelectItem value="90days">3 เดือนล่าสุด</SelectItem>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ปั๊ม</TableHead>
                      <TableHead>ประเภทน้ำมัน</TableHead>
                      <TableHead>ปริมาณ</TableHead>
                      <TableHead>ยอดเงิน</TableHead>
                      <TableHead>แต้มที่ได้</TableHead>
                      <TableHead>สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>{transaction.pumpNumber}</TableCell>
                        <TableCell>{transaction.fuelType}</TableCell>
                        <TableCell>{transaction.estimatedVolume}L</TableCell>
                        <TableCell>฿{transaction.amount}</TableCell>
                        <TableCell>{Math.floor(parseFloat(transaction.amount) * 0.1)} แต้ม</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === "success" ? "default" : "destructive"}>
                            {transaction.status === "success" ? "สำเร็จ" : "ล้มเหลว"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRewards.map((reward) => (
                <Card key={reward.id} className="relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{reward.title}</CardTitle>
                        <CardDescription>{reward.description}</CardDescription>
                      </div>
                      <Gift className="h-5 w-5 text-orange-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">ราคา:</span>
                        <span className="text-lg font-bold">{reward.pointsCost.toLocaleString()} แต้ม</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">มูลค่า:</span>
                        <span className="text-sm font-medium">฿{reward.value}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            disabled={customer.loyaltyPoints < reward.pointsCost}
                            onClick={() => setSelectedReward(reward)}
                          >
                            {customer.loyaltyPoints >= reward.pointsCost ? "แลกรางวัล" : "แต้มไม่เพียงพอ"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>ยืนยันการแลกรางวัล</DialogTitle>
                            <DialogDescription>
                              คุณต้องการแลก "{reward.title}" ด้วย {reward.pointsCost.toLocaleString()} แต้ม?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex gap-4">
                            <Button 
                              onClick={() => redeemRewardMutation.mutate(reward.id)}
                              disabled={redeemRewardMutation.isPending}
                              className="flex-1"
                            >
                              ยืนยัน
                            </Button>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">ยกเลิก</Button>
                            </DialogTrigger>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                <CardDescription>จัดการข้อมูลบัญชีของคุณ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                    <Input id="name" defaultValue={customer.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล</Label>
                    <Input id="email" type="email" defaultValue={customer.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input id="phone" defaultValue={customer.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favoriteStation">ปั๊มที่ใช้บ่อย</Label>
                    <Select defaultValue={customer.favoriteStation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Station 01">ปั๊ม 01 - ถนนสุขุมวิท</SelectItem>
                        <SelectItem value="Station 02">ปั๊ม 02 - ถนนพระราม 4</SelectItem>
                        <SelectItem value="Station 03">ปั๊ม 03 - ถนนเพชรบุรี</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={() => updateProfileMutation.mutate({})}
                  disabled={updateProfileMutation.isPending}
                >
                  บันทึกข้อมูล
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>การแจ้งเตือน</CardTitle>
                <CardDescription>ตั้งค่าการรับข่าวสารและการแจ้งเตือน</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">โปรโมชั่นและข้อเสนอพิเศษ</h4>
                      <p className="text-sm text-gray-600">รับข่าวสารโปรโมชั่นล่าสุด</p>
                    </div>
                    <Button variant="outline" size="sm">เปิด</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">การแจ้งเตือนแต้มสะสม</h4>
                      <p className="text-sm text-gray-600">แจ้งเตือนเมื่อมีแต้มใหม่หรือกำลังหมดอายุ</p>
                    </div>
                    <Button variant="outline" size="sm">เปิด</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">การบำรุงรักษารถ</h4>
                      <p className="text-sm text-gray-600">แจ้งเตือนกำหนดการบำรุงรักษา</p>
                    </div>
                    <Button variant="outline" size="sm">ปิด</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">ราคาน้ำมัน</h4>
                      <p className="text-sm text-gray-600">แจ้งเตือนการเปลี่ยนแปลงราคาน้ำมัน</p>
                    </div>
                    <Button variant="outline" size="sm">เปิด</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}