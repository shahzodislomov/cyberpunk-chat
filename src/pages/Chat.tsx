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
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Activity,
  Cpu,
  Hash,
  LogOut,
  Menu,
  MessageSquarePlus,
  Plus,
  Radio,
  Send,
  Signal,
  Terminal,
  Trash2,
  User,
  Wifi,
  Zap
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
    <div className="flex h-full flex-col bg-sidebar/50 backdrop-blur-md border-r border-primary/20">
      <div className="p-4 border-b border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-tighter text-primary flex items-center gap-2 select-none">
            <Terminal className="h-5 w-5" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">NEOCHAT_SYS</span>
          </h1>
          <div className="flex gap-1">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <div className="h-2 w-2 bg-primary/50 rounded-full animate-pulse delay-75" />
            <div className="h-2 w-2 bg-primary/30 rounded-full animate-pulse delay-150" />
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start gap-2 border-primary/50 hover:bg-primary/20 hover:text-primary transition-all duration-300 group" variant="outline">
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" /> 
              <span className="tracking-widest text-xs">INIT_CHANNEL</span>
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

      <div className="px-4 py-2 text-[10px] text-muted-foreground font-mono border-b border-primary/10 flex justify-between items-center">
        <span>AVAILABLE FREQUENCIES</span>
        <span className="text-primary/50">{channels?.length || 0} DETECTED</span>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {channels?.map((channel) => (
            <Button
              key={channel._id}
              variant={selectedChannelId === channel._id ? "secondary" : "ghost"}
              className={`w-full justify-between group relative overflow-hidden transition-all duration-300 ${
                selectedChannelId === channel._id 
                  ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(var(--primary),0.2)]" 
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/30"
              }`}
              onClick={() => onSelectChannel(channel._id)}
            >
              <div className="flex items-center gap-2 z-10">
                <Hash className={`h-3 w-3 ${selectedChannelId === channel._id ? "animate-pulse" : "opacity-50"}`} />
                <span className="font-mono text-sm tracking-tight">{channel.name}</span>
              </div>
              {selectedChannelId === channel._id && (
                <motion.div 
                  layoutId="active-channel"
                  className="absolute inset-0 bg-primary/5 z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <div className="text-[10px] opacity-50 font-mono z-10">
                {selectedChannelId === channel._id ? "ACTIVE" : "IDLE"}
              </div>
            </Button>
          ))}
          {channels?.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8 border border-dashed border-primary/20 rounded-md m-2">
              <Wifi className="h-8 w-8 mx-auto mb-2 opacity-20" />
              NO SIGNALS DETECTED
            </div>
          )}
        </div>
      </ScrollArea>

      {/* System Status Panel */}
      <div className="px-4 py-3 border-t border-primary/20 bg-black/20 space-y-2">
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU</span>
          <span className="text-primary">12%</span>
        </div>
        <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary/50 w-[12%] animate-pulse" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> MEM</span>
          <span className="text-accent">45%</span>
        </div>
        <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
          <div className="h-full bg-accent/50 w-[45%]" />
        </div>
      </div>

      <div className="p-4 border-t border-primary/30 bg-sidebar-accent/10">
        <div className="flex items-center gap-3 mb-3 group cursor-pointer">
          <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center border border-primary/50 group-hover:bg-primary/20 transition-colors relative overflow-hidden">
            <User className="h-5 w-5 text-primary relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate text-primary font-mono tracking-tight">
              {user?.name || "ANONYMOUS"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate font-mono">
              ID: {user?._id?.slice(0, 8) || "UNKNOWN"}...
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-all"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" /> 
          <span className="font-mono tracking-wider text-xs">TERMINATE_SESSION</span>
        </Button>
      </div>
    </div>
  );
}

function ChatArea({ channelId }: { channelId: Id<"channels"> }) {
  const messages = useQuery(api.messages.list, { channelId });
  const channel = useQuery(api.channels.get, { id: channelId });
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
    <div className="flex flex-col h-full z-10 relative">
      {/* Scanline overlay for chat area specifically */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-[5] bg-[length:100%_2px,3px_100%]"></div>

      {/* Chat Header */}
      <div className="h-14 border-b border-primary/30 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center border border-primary/30">
            <Hash className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary tracking-wider flex items-center gap-2">
              {channel?.name || "LOADING..."}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                SECURE
              </span>
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono">
              {channel?.description || "ENCRYPTED CHANNEL CONNECTION ESTABLISHED"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground hidden sm:flex">
          <div className="flex items-center gap-1.5">
            <Signal className="h-3 w-3 text-green-500" />
            <span>SIGNAL: STRONG</span>
          </div>
          <div className="h-4 w-px bg-primary/20" />
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>PWR: 98%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4 relative z-10">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 pb-4">
            {messages?.slice().reverse().map((msg, index) => {
              const isCurrentUser = msg.userId === user?._id;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={msg._id}
                  className={`flex gap-4 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`h-10 w-10 rounded-sm flex-shrink-0 flex items-center justify-center border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                    isCurrentUser 
                      ? "bg-primary/10 border-primary text-primary" 
                      : "bg-secondary/50 border-secondary text-secondary-foreground"
                  }`}>
                    <span className="text-sm font-bold font-mono">{msg.userName.charAt(0).toUpperCase()}</span>
                  </div>
                  
                  <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                      <span className={`text-xs font-bold font-mono ${isCurrentUser ? "text-primary" : "text-secondary-foreground"}`}>
                        {isCurrentUser ? "YOU" : msg.userName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        [{new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                      </span>
                    </div>
                    
                    <div className={`group relative p-4 text-sm border backdrop-blur-sm shadow-sm ${
                      isCurrentUser 
                        ? "bg-primary/5 border-primary/40 text-foreground rounded-tl-lg rounded-bl-lg rounded-br-lg" 
                        : "bg-card/50 border-border/50 text-foreground rounded-tr-lg rounded-bl-lg rounded-br-lg"
                    }`}>
                      {/* Decorative corner accents */}
                      <div className={`absolute top-0 w-2 h-2 border-t border-l ${isCurrentUser ? "left-0 border-primary" : "left-0 border-secondary-foreground/50"}`} />
                      <div className={`absolute bottom-0 w-2 h-2 border-b border-r ${isCurrentUser ? "right-0 border-primary" : "right-0 border-secondary-foreground/50"}`} />
                      
                      <p className="leading-relaxed font-mono whitespace-pre-wrap">{msg.content}</p>
                      
                      {isCurrentUser && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-sm p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md border border-destructive/50"
                          title="Purge Message"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-primary/30 bg-background/90 backdrop-blur-md z-20">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
          <div className="flex-1 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded opacity-20 group-hover:opacity-50 transition duration-500 blur"></div>
            <div className="relative flex items-center bg-black/40 border border-primary/50 rounded overflow-hidden">
              <div className="pl-3 pr-2 text-primary font-mono select-none animate-pulse">{">"}</div>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="ENTER_COMMAND..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 font-mono text-sm h-12 placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            size="icon" 
            className="h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="text-[10px] text-muted-foreground mt-2 font-mono text-center opacity-50">
          PRESS ENTER TO TRANSMIT // ENCRYPTED VIA CONVEX PROTOCOL
        </div>
      </div>
    </div>
  );
}