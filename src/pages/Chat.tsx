import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import {
  Hash,
  LogOut,
  Menu,
  MessageSquarePlus,
  Plus,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Chat() {
  const { user, signOut, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedChannelId, setSelectedChannelId] = useState<Id<"channels"> | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const channels = useQuery(api.channels.list);
  
  // Select first channel by default if none selected
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0]._id);
    }
  }, [channels, selectedChannelId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="animate-pulse text-xl font-mono text-primary">INITIALIZING SYSTEM...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-mono">
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="border-primary text-primary hover:bg-primary/20">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 border-r border-primary bg-background p-0">
            <Sidebar 
              selectedChannelId={selectedChannelId} 
              onSelectChannel={(id) => {
                setSelectedChannelId(id);
                setIsMobileMenuOpen(false);
              }}
              user={user}
              signOut={signOut}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 flex-col border-r border-primary/30 bg-sidebar">
        <Sidebar 
          selectedChannelId={selectedChannelId} 
          onSelectChannel={setSelectedChannelId}
          user={user}
          signOut={signOut}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0"></div>
        
        {selectedChannelId ? (
          <ChatArea channelId={selectedChannelId} />
        ) : (
          <div className="flex flex-1 items-center justify-center z-10">
            <div className="text-center space-y-4">
              <MessageSquarePlus className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Select a channel to start transmission</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Sidebar({ 
  selectedChannelId, 
  onSelectChannel,
  user,
  signOut
}: { 
  selectedChannelId: Id<"channels"> | null, 
  onSelectChannel: (id: Id<"channels">) => void,
  user: any,
  signOut: () => void
}) {
  const channels = useQuery(api.channels.list);
  const createChannel = useMutation(api.channels.create);
  const [newChannelName, setNewChannelName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    
    try {
      const channelId = await createChannel({ name: newChannelName });
      setNewChannelName("");
      setIsDialogOpen(false);
      onSelectChannel(channelId);
      toast.success("Channel initialized");
    } catch (error) {
      toast.error("Failed to create channel");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-tighter text-primary flex items-center gap-2">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            NEOCHAT
          </h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start gap-2 border-primary/50 hover:bg-primary/20 hover:text-primary" variant="outline">
              <Plus className="h-4 w-4" /> Initialize Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="border-primary bg-background sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-primary">New Frequency</DialogTitle>
              <DialogDescription>
                Establish a new communication channel.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateChannel} className="space-y-4 mt-4">
              <Input
                placeholder="Channel Name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="border-primary/50 focus-visible:ring-primary"
              />
              <DialogFooter>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {channels?.map((channel) => (
            <Button
              key={channel._id}
              variant={selectedChannelId === channel._id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 font-normal ${
                selectedChannelId === channel._id 
                  ? "bg-primary/20 text-primary border border-primary/50" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              onClick={() => onSelectChannel(channel._id)}
            >
              <Hash className="h-4 w-4 opacity-70" />
              {channel.name}
            </Button>
          ))}
          {channels?.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">
              No active frequencies found.
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-primary/30 bg-sidebar-accent/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-primary">
              {user?.name || "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "Guest User"}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" /> Disconnect
        </Button>
      </div>
    </div>
  );
}

function ChatArea({ channelId }: { channelId: Id<"channels"> }) {
  const messages = useQuery(api.messages.list, { channelId });
  const sendMessage = useMutation(api.messages.send);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const { user } = useAuth();
  
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage({ channelId, content: newMessage });
      setNewMessage("");
    } catch (error) {
      toast.error("Transmission failed");
    }
  };

  const handleDeleteMessage = async (id: Id<"messages">) => {
    try {
      await deleteMessage({ id });
      toast.success("Message purged");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="flex flex-col h-full z-10">
      <div className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {messages?.slice().reverse().map((msg) => {
              const isCurrentUser = msg.userId === user?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`h-8 w-8 rounded flex-shrink-0 flex items-center justify-center border ${
                    isCurrentUser ? "bg-primary/20 border-primary text-primary" : "bg-muted border-muted-foreground/30 text-muted-foreground"
                  }`}>
                    <span className="text-xs font-bold">{msg.userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={`flex flex-col max-w-[75%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary/80">{msg.userName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`group relative rounded-lg p-3 text-sm border ${
                      isCurrentUser 
                        ? "bg-primary/10 border-primary/50 text-foreground" 
                        : "bg-card border-border text-foreground"
                    }`}>
                      {msg.content}
                      {isCurrentUser && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-primary/30 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter transmission..."
            className="flex-1 bg-background border-primary/50 focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
