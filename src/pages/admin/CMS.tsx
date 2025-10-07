import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { FAQManager, FAQ } from '@/components/cms/FAQManager';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';

interface CMSContent {
  brandStory: string;
  termsConditions: string;
  privacyPolicy: string;
  faqs: FAQ[];
  refundPolicy: string;
}

export default function CMS() {
  const { toast } = useToast();
  const { token } = useAuth();
  const API_URL = "https://villorya-server.vercel.app/api/v1/cms";

  const [content, setContent] = useState<CMSContent>({
    brandStory: '',
    termsConditions: '',
    privacyPolicy: '',
    faqs: [],
    refundPolicy: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch CMS content from API
  const fetchCMSContent = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, axiosConfig);
      const data = res.data.data;
      // Ensure faqs is always an array
      if (!Array.isArray(data.faqs)) data.faqs = [];
      setContent(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || error.message || 'Failed to fetch CMS content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSContent();
  }, [token]);

  const handleSave = async (section: keyof CMSContent, sectionName: string) => {
    setSaving(true);
    try {
      const res = await axios.put(API_URL, content, axiosConfig);
      setContent(res.data.data);
      toast({
        title: 'Content saved',
        description: `${sectionName} has been saved successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error saving content',
        description: error?.response?.data?.message || error.message || 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-10">Loading CMS content...</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">CMS Content</h1>
        <p className="text-muted-foreground">
          Manage your website content with rich text editing
        </p>
      </div>

      <Card className="glass-panel p-6">
        <Tabs defaultValue="brandStory" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="brandStory">Brand Story</TabsTrigger>
            <TabsTrigger value="termsConditions">Terms & Conditions</TabsTrigger>
            <TabsTrigger value="privacyPolicy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="refundPolicy">Refund Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="brandStory" className="space-y-4 mt-6">
            <Label>Brand Story</Label>
            <RichTextEditor
              value={content.brandStory}
              onChange={(value) => setContent({ ...content, brandStory: value })}
              placeholder="Write your brand story here..."
            />
            <Button onClick={() => handleSave('brandStory', 'Brand Story')} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Brand Story'}
            </Button>
          </TabsContent>

          <TabsContent value="termsConditions" className="space-y-4 mt-6">
            <Label>Terms & Conditions</Label>
            <RichTextEditor
              value={content.termsConditions}
              onChange={(value) => setContent({ ...content, termsConditions: value })}
              placeholder="Write your terms and conditions here..."
            />
            <Button onClick={() => handleSave('termsConditions', 'Terms & Conditions')} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Terms & Conditions'}
            </Button>
          </TabsContent>

          <TabsContent value="privacyPolicy" className="space-y-4 mt-6">
            <Label>Privacy Policy</Label>
            <RichTextEditor
              value={content.privacyPolicy}
              onChange={(value) => setContent({ ...content, privacyPolicy: value })}
              placeholder="Write your privacy policy here..."
            />
            <Button onClick={() => handleSave('privacyPolicy', 'Privacy Policy')} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Privacy Policy'}
            </Button>
          </TabsContent>

          <TabsContent value="faqs" className="space-y-4 mt-6">
            <FAQManager
              faqs={content.faqs}
              onChange={(faqs) => setContent({ ...content, faqs })}
            />
            <Button onClick={() => handleSave('faqs', 'FAQs')} disabled={saving} className="gap-2 w-full">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save All FAQs'}
            </Button>
          </TabsContent>

          <TabsContent value="refundPolicy" className="space-y-4 mt-6">
            <Label>Refund Policy</Label>
            <RichTextEditor
              value={content.refundPolicy}
              onChange={(value) => setContent({ ...content, refundPolicy: value })}
              placeholder="Write your refund policy here..."
            />
            <Button onClick={() => handleSave('refundPolicy', 'Refund Policy')} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Refund Policy'}
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
