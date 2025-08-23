import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Zap, CheckCircle2, ArrowRight } from "lucide-react"

interface AgentCardProps {
  title: string
  description: string
  features: string[]
  icon: React.ReactNode
  status: "active" | "standby" | "processing"
  onInteract: () => void
  className?: string
}

const statusConfig = {
  active: { 
    color: "bg-green-500", 
    text: "Active", 
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
  },
  standby: { 
    color: "bg-yellow-500", 
    text: "Standby", 
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" 
  },
  processing: { 
    color: "bg-blue-500", 
    text: "Processing", 
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
  }
}

export function AgentCard({ 
  title, 
  description, 
  features, 
  icon, 
  status, 
  onInteract,
  className 
}: AgentCardProps) {
  const statusInfo = statusConfig[status]
  
  return (
    <Card className={`shadow-card hover:shadow-elegant transition-smooth border-2 hover:border-primary/30 group ${className}`}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${statusInfo.color} animate-pulse`} />
                <Badge variant="secondary" className={statusInfo.badge}>
                  {statusInfo.text}
                </Badge>
              </div>
            </div>
          </div>
          <Bot className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-smooth" />
        </div>
        
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Key Features
          </h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          variant="agent" 
          className="w-full group-hover:variant-hero transition-smooth"
          onClick={onInteract}
        >
          <span>Interact with Agent</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
        </Button>
      </CardContent>
    </Card>
  )
}