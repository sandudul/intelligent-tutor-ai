import { AgentCard } from "@/components/agent-card"
import { FileText, HelpCircle, MessageSquare, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AgentsDashboard() {
  const { toast } = useToast()
  
  const handleAgentInteraction = (agentName: string) => {
    toast({
      title: `${agentName} Activated`,
      description: "Connect to Supabase to enable full AI agent functionality with Gemini AI integration.",
    })
  }
  
  const agents = [
    {
      title: "Content Generator",
      description: "Creates personalized learning materials, explanations, and educational content tailored to individual learning styles and comprehension levels.",
      features: [
        "Personalized content creation",
        "Multi-format materials (text, visual, interactive)",
        "Adaptive difficulty adjustment",
        "Subject-specific expertise",
        "Learning style optimization"
      ],
      icon: <FileText className="h-6 w-6" />,
      status: "active" as const,
      onInteract: () => handleAgentInteraction("Content Generator")
    },
    {
      title: "Question Setter",
      description: "Generates intelligent questions and assessments that test understanding, promote critical thinking, and identify knowledge gaps.",
      features: [
        "Intelligent question generation",
        "Multiple question types (MCQ, essay, practical)",
        "Difficulty calibration",
        "Knowledge gap identification",
        "Progress tracking"
      ],
      icon: <HelpCircle className="h-6 w-6" />,
      status: "standby" as const,
      onInteract: () => handleAgentInteraction("Question Setter")
    },
    {
      title: "Feedback Evaluator", 
      description: "Provides detailed, constructive feedback on student responses, identifies areas for improvement, and suggests learning pathways.",
      features: [
        "Detailed response analysis",
        "Constructive feedback generation",
        "Performance insights",
        "Learning pathway recommendations",
        "Progress visualization"
      ],
      icon: <MessageSquare className="h-6 w-6" />,
      status: "processing" as const,
      onInteract: () => handleAgentInteraction("Feedback Evaluator")
    }
  ]
  
  return (
    <section id="agents" className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold">AI Agent Ecosystem</h2>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Meet our three specialized AI agents that work collaboratively to provide 
            a comprehensive, personalized learning experience tailored to each student's needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <AgentCard
              key={agent.title}
              {...agent}
              className={`transform hover:scale-105 transition-bounce delay-${index * 100}`}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Agents communicate via secure API protocols
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}