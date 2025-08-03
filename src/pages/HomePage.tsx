import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Welcome to{' '}
          <span className="text-primary">TappsHA</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Modern web application built with Agent OS best practices for spec-driven agentic development.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Built with Agent OS</h2>
          <p className="text-muted-foreground mt-2">
            Leveraging the power of Agent OS for consistent, high-quality development
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile-First Design</CardTitle>
              <CardDescription>
                Responsive design that works perfectly on all devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built with accessibility in mind, following WCAG 2.2 AA standards for inclusive user experiences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TypeScript-First</CardTitle>
              <CardDescription>
                Type-safe development with comprehensive error checking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Full TypeScript support with strict type checking and excellent developer experience.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent OS Integration</CardTitle>
              <CardDescription>
                AI-assisted development with structured workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use Agent OS commands for planning, analysis, specification, and execution.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join us in building the future of web applications with Agent OS best practices.
        </p>
        <Button size="lg">
          Start Building
        </Button>
      </section>
    </div>
  )
}

export default HomePage 