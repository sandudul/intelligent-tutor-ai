import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, Zap, ArrowDown } from "lucide-react"
import heroImage from "@/assets/hero-ai-tutoring.jpg"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="gradient-primary text-white px-4 py-2 text-sm font-medium">
                <Zap className="h-4 w-4 mr-2" />
                Next-Gen AI Education
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Multi-Agent
                <span className="gradient-primary bg-clip-text text-transparent"> AI Tutoring </span>
                System
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Experience revolutionary education with three specialized AI agents working collaboratively: 
                <strong className="text-foreground"> Content Generator</strong>, 
                <strong className="text-foreground"> Question Setter</strong>, and 
                <strong className="text-foreground"> Feedback Evaluator</strong>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="animate-pulse-glow">
                <Brain className="h-5 w-5 mr-2" />
                Start Learning
              </Button>
              <Button variant="outline" size="xl">
                <Users className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Availability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Personalized</div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="absolute inset-0 gradient-primary rounded-3xl opacity-20 blur-3xl animate-pulse" />
            <img 
              src={heroImage}
              alt="Multi-Agent AI Tutoring System"
              className="relative rounded-3xl shadow-elegant w-full h-auto animate-float"
            />
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </section>
  )
}