import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { toast } from '@/hooks/use-toast';

const SystemSettings = () => {
  // General Settings State
  const [schoolName, setSchoolName] = useState('MusicAcademy');
  const [adminEmail, setAdminEmail] = useState('admin@musicacademy.com');
  const [phoneNumber, setPhoneNumber] = useState('(555) 123-4567');
  const [address, setAddress] = useState('123 Music Street, Harmony City, HC 12345');
  
  // Email Settings State
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [emailServiceProvider, setEmailServiceProvider] = useState('smtp');
  const [emailFromAddress, setEmailFromAddress] = useState('no-reply@musicacademy.com');
  const [emailTemplateStyle, setEmailTemplateStyle] = useState('modern');
  
  // System Security State
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState('medium');
  
  // Payment Settings State
  const [paymentMethods, setPaymentMethods] = useState({
    creditCard: true,
    bankTransfer: true,
    cash: true,
    paypal: false,
  });
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('7.5');

  const handleSaveSettings = (section: string) => {
    // In a real application, this would save to the database
    toast({
      title: "Settings Saved",
      description: `Your ${section} settings have been updated successfully.`,
    });
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="show"
      variants={fadeIn("up", 0.5)}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic information about your music school</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input 
                    id="schoolName" 
                    value={schoolName} 
                    onChange={(e) => setSchoolName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Administrator Email</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="america_new_york">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_new_york">America/New York</SelectItem>
                      <SelectItem value="america_los_angeles">America/Los Angeles</SelectItem>
                      <SelectItem value="america_chicago">America/Chicago</SelectItem>
                      <SelectItem value="europe_london">Europe/London</SelectItem>
                      <SelectItem value="asia_tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                  />
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input 
                    id="website" 
                    defaultValue="https://www.musicacademy.com" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('general')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email notifications and delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableEmail" 
                  checked={enableEmailNotifications} 
                  onCheckedChange={setEnableEmailNotifications}
                />
                <Label htmlFor="enableEmail">Enable email notifications</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="emailService">Email Service Provider</Label>
                  <Select 
                    value={emailServiceProvider} 
                    onValueChange={setEmailServiceProvider}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select email service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP Server</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="aws_ses">AWS SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email Address</Label>
                  <Input 
                    id="fromEmail" 
                    type="email" 
                    value={emailFromAddress} 
                    onChange={(e) => setEmailFromAddress(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailTemplate">Email Template Style</Label>
                  <Select 
                    value={emailTemplateStyle} 
                    onValueChange={setEmailTemplateStyle}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="colorful">Colorful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailFrequency">Default Email Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <Label>Notification Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-registration" defaultChecked />
                    <Label htmlFor="email-registration">New registrations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-payment" defaultChecked />
                    <Label htmlFor="email-payment">Payment confirmations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-reminder" defaultChecked />
                    <Label htmlFor="email-reminder">Class reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-marketing" />
                    <Label htmlFor="email-marketing">Marketing messages</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('email')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure access control and security measures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input 
                    id="sessionTimeout" 
                    type="number" 
                    value={sessionTimeout} 
                    onChange={(e) => setSessionTimeout(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select 
                    value={passwordPolicy} 
                    onValueChange={setPasswordPolicy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select password policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (6+ characters)</SelectItem>
                      <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                      <SelectItem value="high">High (10+ chars, mixed case, numbers)</SelectItem>
                      <SelectItem value="very_high">Very High (12+ chars, mixed case, numbers, symbols)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue placeholder="Select max attempts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lockoutPeriod">Account Lockout Period</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select lockout period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="twoFactorAuth" 
                    checked={enableTwoFactor} 
                    onCheckedChange={setEnableTwoFactor}
                  />
                  <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Label>Security Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="security-ip" defaultChecked />
                      <Label htmlFor="security-ip">IP address monitoring</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="security-activity" defaultChecked />
                      <Label htmlFor="security-activity">Suspicious activity detection</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="security-logging" defaultChecked />
                      <Label htmlFor="security-logging">Advanced security logging</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('security')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment methods and processing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={currency} 
                    onValueChange={setCurrency}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number" 
                    value={taxRate} 
                    onChange={(e) => setTaxRate(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                  <Input id="invoicePrefix" defaultValue="INV-" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Default Payment Terms</Label>
                  <Select defaultValue="14">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Due on receipt</SelectItem>
                      <SelectItem value="7">Net 7 days</SelectItem>
                      <SelectItem value="14">Net 14 days</SelectItem>
                      <SelectItem value="30">Net 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <Label>Accepted Payment Methods</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="payment-credit-card" 
                      checked={paymentMethods.creditCard} 
                      onCheckedChange={(checked) => 
                        setPaymentMethods({...paymentMethods, creditCard: checked === true})
                      } 
                    />
                    <Label htmlFor="payment-credit-card">Credit/Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="payment-bank-transfer" 
                      checked={paymentMethods.bankTransfer} 
                      onCheckedChange={(checked) => 
                        setPaymentMethods({...paymentMethods, bankTransfer: checked === true})
                      } 
                    />
                    <Label htmlFor="payment-bank-transfer">Bank Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="payment-cash" 
                      checked={paymentMethods.cash} 
                      onCheckedChange={(checked) => 
                        setPaymentMethods({...paymentMethods, cash: checked === true})
                      } 
                    />
                    <Label htmlFor="payment-cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="payment-paypal" 
                      checked={paymentMethods.paypal} 
                      onCheckedChange={(checked) => 
                        setPaymentMethods({...paymentMethods, paypal: checked === true})
                      } 
                    />
                    <Label htmlFor="payment-paypal">PayPal</Label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <Label>Payment Gateway</Label>
                <Select defaultValue="stripe">
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="manual">Manual Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('payment')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>Configure backup settings and restore data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="backupTime">Backup Time</Label>
                  <Select defaultValue="0200">
                    <SelectTrigger>
                      <SelectValue placeholder="Select backup time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0000">12:00 AM</SelectItem>
                      <SelectItem value="0200">2:00 AM</SelectItem>
                      <SelectItem value="0400">4:00 AM</SelectItem>
                      <SelectItem value="1200">12:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Retention Period</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storageLocation">Storage Location</Label>
                  <Select defaultValue="cloud">
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Server</SelectItem>
                      <SelectItem value="cloud">Cloud Storage</SelectItem>
                      <SelectItem value="both">Both (Redundant)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="compression" defaultChecked />
                  <Label htmlFor="compression">Enable compression</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="encryption" defaultChecked />
                  <Label htmlFor="encryption">Encrypt backups</Label>
                </div>
              </div>
              
              <div className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Manual Backup</h3>
                  <p className="text-sm text-gray-500">Create an immediate backup of your system</p>
                </div>
                <Button>Create Backup Now</Button>
              </div>
              
              <div className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Restore from Backup</h3>
                  <p className="text-sm text-gray-500">Restore your system from a previous backup</p>
                </div>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select backup to restore" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select a backup...</SelectItem>
                    <SelectItem value="backup-20250410-0200">April 10, 2025 - 2:00 AM</SelectItem>
                    <SelectItem value="backup-20250409-0200">April 9, 2025 - 2:00 AM</SelectItem>
                    <SelectItem value="backup-20250408-0200">April 8, 2025 - 2:00 AM</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive">Restore Selected Backup</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('backup')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SystemSettings;