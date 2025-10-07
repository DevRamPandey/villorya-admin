import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/cms/RichTextEditor';
import { FAQManager, FAQ } from '@/components/cms/FAQManager';

interface CMSContent {
  brandStory: string;
  termsConditions: string;
  privacyPolicy: string;
  faqs: FAQ[];
  refundPolicy: string;
}

export default function CMS() {
  const { toast } = useToast();
  const [content, setContent] = useState<CMSContent>({
    brandStory: '',
    termsConditions: '',
    privacyPolicy: '',
    faqs: [],
    refundPolicy: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('cmsContent');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure faqs is always an array
      if (typeof parsed.faqs === 'string') {
        parsed.faqs = [];
      }
      setContent(parsed);
    }
  }, []);

  const handleSave = (section: keyof CMSContent, sectionName: string) => {
    localStorage.setItem('cmsContent', JSON.stringify(content));
    toast({ 
      title: 'Content saved',
      description: `${sectionName} has been saved successfully`,
    });
  };

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
            <div className="space-y-4">
              <Label>Brand Story</Label>
              <RichTextEditor
                value={content.brandStory}
                onChange={(value) =>
                  setContent({ ...content, brandStory: value })
                }
                placeholder="Write your brand story here..."
              />
              <Button
                onClick={() => handleSave('brandStory', 'Brand Story')}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Brand Story
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="termsConditions" className="space-y-4 mt-6">
            <div className="space-y-4">
              <Label>Terms & Conditions</Label>
              <RichTextEditor
                value={content.termsConditions}
                onChange={(value) =>
                  setContent({ ...content, termsConditions: value })
                }
                placeholder="Write your terms and conditions here..."
              />
              <Button
                onClick={() => handleSave('termsConditions', 'Terms & Conditions')}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Terms & Conditions
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="privacyPolicy" className="space-y-4 mt-6">
            <div className="space-y-4">
              <Label>Privacy Policy</Label>
              <RichTextEditor
                value={content.privacyPolicy}
                onChange={(value) =>
                  setContent({ ...content, privacyPolicy: value })
                }
                placeholder="Write your privacy policy here..."
              />
              <Button
                onClick={() => handleSave('privacyPolicy', 'Privacy Policy')}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Privacy Policy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="faqs" className="space-y-4 mt-6">
            <FAQManager
              faqs={content.faqs}
              onChange={(faqs) => setContent({ ...content, faqs })}
            />
            <Button
              onClick={() => handleSave('faqs', 'FAQs')}
              className="gap-2 w-full"
            >
              <Save className="h-4 w-4" />
              Save All FAQs
            </Button>
          </TabsContent>

          <TabsContent value="refundPolicy" className="space-y-4 mt-6">
            <div className="space-y-4">
              <Label>Refund Policy</Label>
              <RichTextEditor
                value={content.refundPolicy}
                onChange={(value) =>
                  setContent({ ...content, refundPolicy: value })
                }
                placeholder="Write your refund policy here..."
              />
              <Button
                onClick={() => handleSave('refundPolicy', 'Refund Policy')}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Refund Policy
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
