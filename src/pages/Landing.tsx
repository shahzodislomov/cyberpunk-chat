import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Zap } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-mono overflow-hidden relative">
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between p-6 border-b border-primary/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-xl font-bold tracking-tighter text-primary">NEOCHAT</span>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => navigate("/auth")}
          >
            {isAuthenticated ? "DASHBOARD" : "LOGIN"}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-8"
        >
          <div className="inline-block border border-primary/50 bg-primary/10 px-4 py-1.5 rounded-full text-sm text-primary mb-4">
            <span className="animate-pulse mr-2">●</span>
            SECURE COMMUNICATION PROTOCOL
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
            FUTURE OF MESSAGING
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Encrypted channels. Real-time synchronization. Cyberpunk aesthetics.
            Experience the next generation of digital communication.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px] h-14 text-lg border border-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
              onClick={() => navigate(isAuthenticated ? "/chat" : "/auth")}
            >
              {isAuthenticated ? "ENTER SYSTEM" : "INITIALIZE"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="min-w-[200px] h-14 text-lg border-primary/50 text-primary hover:bg-primary/10"
            >
              <Zap className="mr-2 h-5 w-5" />
              VIEW PROTOCOLS
            </Button>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/30 p-6 text-center text-sm text-muted-foreground">
        <p>© 2025 NEOCHAT SYSTEMS. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}