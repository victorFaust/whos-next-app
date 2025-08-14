import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Settings, Upload, Users } from 'lucide-react';
import { text } from 'stream/consumers';

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/Who’s.gif')", backgroundSize: '50%' }}
    >
      <div className="max-w-4xl mx-auto space-y-12 text-center h-0 pt-100">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" className="bg-[#cc0000] hover:bg-[#b30000]">
              <a href="/play">
                <Play className="h-5 w-5 mr-2" />
                Start Playing
              </a>
            </Button>
            {/* <Button asChild variant="outline" size="lg">
              <a href="/admin">
                <Settings className="h-5 w-5 mr-2" />
                Admin Panel
              </a>
            </Button> */}
          </div>
        </div>

        {/* Powered By Footer */}
       <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
 <p className="text-sm text-gray-500">Powered by <strong className="text-[#cc0000]">CIO KSS Team</strong></p>
</div>
      </div>
    </div>
  );
}