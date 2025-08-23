import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Zap, 
  Globe, 
  Database, 
  Brain, 
  Users,
  Lock,
  MessageCircle,
  Search,
  Cpu
} from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      category: "AI & NLP",
      icon: <Brain className="h-6 w-6" />,
      items: [
        {
          title: "Large Language Models",
          description: "Powered by Gemini AI for advanced understanding and generation",
          icon: <Cpu className="h-5 w-5" />
        },
        {
          title: "Natural Language Processing", 
          description: "Advanced NER, summarization, and text analysis capabilities",
          icon: <MessageCircle className="h-5 w-5" />
        },
        {
          title: "Information Retrieval",
          description: "Intelligent content discovery and knowledge extraction",
          icon: <Search className="h-5 w-5" />
        }
      ]
    },
    {
      category: "Security & Communication",
      icon: <Shield className="h-6 w-6" />,
      items: [
        {
          title: "Secure Authentication",
          description: "Multi-layer security with encrypted user authentication",
          icon: <Lock className="h-5 w-5" />
        },
        {
          title: "Agent Communication",
          description: "MCP and API-based protocols for seamless agent interaction",
          icon: <Users className="h-5 w-5" />
        },
        {
          title: "Data Protection",
          description: "Input sanitization and end-to-end encryption",
          icon: <Shield className="h-5 w-5" />
        }
      ]
    },
    {
      category: "Performance & Scale",
      icon: <Zap className="h-6 w-6" />,
      items: [
        {
          title: "Real-time Processing",
          description: "Lightning-fast responses and content generation",
          icon: <Zap className="h-5 w-5" />
        },
        {
          title: "Global Accessibility",
          description: "24/7 availability with multi-language support",
          icon: <Globe className="h-5 w-5" />
        },
        {
          title: "Scalable Database",
          description: "Robust data storage and retrieval system",
          icon: <Database className="h-5 w-5" />
        }
      ]
    }
  ]
  
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-muted/10 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <h2 className="text-4xl font-bold">
            Cutting-Edge
            <span className="gradient-primary bg-clip-text text-transparent"> Technology Stack</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built with enterprise-grade technologies and following responsible AI practices 
            for secure, scalable, and intelligent educational experiences.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((category, categoryIndex) => (
            <div key={category.category} className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-full gradient-primary text-white">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold">{category.category}</h3>
              </div>
              
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <Card 
                    key={item.title}
                    className={`shadow-card hover:shadow-elegant transition-smooth transform hover:scale-105 delay-${(categoryIndex * 3 + itemIndex) * 100}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                          {item.icon}
                        </div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {item.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center gap-2 justify-center">
            <Badge variant="secondary" className="gradient-primary text-white">
              Responsible AI
            </Badge>
            <Badge variant="secondary" className="gradient-secondary text-white">
              Enterprise Security
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              24/7 Available
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Multi-Language
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}