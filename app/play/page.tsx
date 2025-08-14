"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';

interface Participant {
  id: number;
  email: string;
  name: string;
  picked: boolean;
}

interface TeamData {
  focusArea: string;
  teamName: string;
}

export default function PlayPage() {
  const { toast } = useToast();
  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [visibleParticipants, setVisibleParticipants] = useState<number[]>([]);
  const [captainIndex, setCaptainIndex] = useState<number>(-1);

  const handlePlay = async () => {
    setIsPlaying(true);
    setCountdown(10);

    try {
      const playResponse = await fetch('/api/play');
      const playResult = await playResponse.json();
      const teamResponse = await fetch('/api/teams');
      const teamResult = await teamResponse.json();

      if (playResponse.ok && teamResponse.ok) {
        if (playResult.selected.length === 0) {
          toast({
            title: "No participants available",
            description: "Please ask an admin to upload a participant list.",
            variant: "destructive",
          });
          setIsPlaying(false);
          setCountdown(null);
        } else {
          setSelectedParticipants(playResult.selected);
          setTeamData(teamResult);
        }
      } else {
        toast({
          title: "Selection failed",
          description: playResult.error || teamResult.error,
          variant: "destructive",
        });
        setIsPlaying(false);
        setCountdown(null);
      }
    } catch (error) {
      toast({
        title: "Selection failed",
        description: "An error occurred while selecting participants or team data.",
        variant: "destructive",
      });
      setIsPlaying(false);
      setCountdown(null);
    }
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setIsPlaying(false);
      setShowModal(true);
      setVisibleParticipants([]);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!showModal || selectedParticipants.length === 0) return;

    const captainIndex = Math.floor(Math.random() * selectedParticipants.length);
    selectedParticipants.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleParticipants(prev => [...prev, index]);
      }, index * 3000);
      return () => clearTimeout(timer);
    });

    setCaptainIndex(captainIndex);
  }, [showModal, selectedParticipants]);

  return (
    <div
      className="min-h-screen bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/Who’s.gif')", backgroundSize: '50%' }}
    >
      <div className="text-center mr-10 pt-120">
        <Button
          onClick={handlePlay}
          disabled={isPlaying}
          size="lg"
          className={`
            h-32 w-32 rounded-full text-xl font-bold transition-all duration-300 transform
            ${isPlaying ? 'animate-pulse scale-110' : 'hover:scale-105'}
            bg-[#cc0000] hover:bg-[#b30000]
          `}
        >
          {isPlaying ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          ) : (
            <Play className="h-12 w-12" />
          )}
        </Button>
      </div>

      {countdown !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <p className="text-9xl font-bold text-white animate-pulse">{countdown}</p>
            <p className="text-xl text-gray-300 mt-4">Selecting your team...</p>
          </div>
        </div>
      )}

      {showModal && teamData && selectedParticipants.length > 0 && (
        <div className="fixed inset-0 z-50">
          <Confetti
            width={typeof window !== 'undefined' ? window.innerWidth : 0}
            height={typeof window !== 'undefined' ? window.innerHeight : 0}
            numberOfPieces={100}
            recycle={true}
            tweenDuration={10000}
            style={{ zIndex: 60 }}
          />
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 transform transition-all duration-500 scale-100 animate-slideInUp">
              <div className="text-center space-y-6">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                <h2 className="text-4xl font-bold text-gray-900">The New Team!</h2>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold text-[#cc0000]">
                    Team: {teamData.teamName}
                  </p>
                  <p className="text-xl text-gray-600">
                    Focus Area: {teamData.focusArea}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {selectedParticipants.map((participant, index) => {
                    const isCaptain = index === captainIndex;
                    return (
                      <Card
                        key={participant.id}
                        className={`transform transition-all duration-1000 hover:scale-105 relative ${
                          visibleParticipants.includes(index)
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-90 translate-y-8'
                        } ${isCaptain ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                      >
                        {isCaptain && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                              CAPTAIN
                            </span>
                          </div>
                        )}
                        <CardContent className="p-6 text-center">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                              isCaptain
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                : 'bg-gradient-to-r from-[#cc0000] to-[#b30000]'
                            }`}
                          >
                            <span className={`text-2xl font-bold ${isCaptain ? 'text-black' : 'text-white'}`}>
                              {isCaptain ? '👑' : index + 1}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{participant.name}</h3>
                          <p className="text-sm text-gray-600 break-all">{participant.email}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <Button
                  onClick={() => {
                    setShowModal(false);
                    setVisibleParticipants([]);
                    setCaptainIndex(-1);
                    window.location.href = '/';
                  }}
                  className="mt-6 bg-[#cc0000] hover:bg-[#b30000]"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <p className="text-sm text-gray-500">
          Powered by <strong className="text-[#cc0000]">CIO KSS Team</strong>
        </p>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}