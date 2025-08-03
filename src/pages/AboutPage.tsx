import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold">About TappsHA</h1>
        <p className="text-xl text-muted-foreground">
          A modern web application demonstrating Agent OS best practices for AI-assisted development.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Our Mission</h2>
        <p className="text-muted-foreground">
          TappsHA showcases how to build high-quality web applications using Agent OS principles. 
          We believe in creating accessible, performant, and maintainable code through structured 
          development workflows and AI assistance.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Frontend</CardTitle>
              <CardDescription>Modern React with TypeScript</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• React 19 + TypeScript 5</p>
              <p className="text-sm">• Vite for fast development</p>
              <p className="text-sm">• TailwindCSS 4.x + shadcn/ui</p>
              <p className="text-sm">• TanStack Query for state management</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backend</CardTitle>
              <CardDescription>Spring Boot with Java 21</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">• Spring Boot 3.3+</p>
              <p className="text-sm">• Java 21 LTS</p>
              <p className="text-sm">• PostgreSQL 17 with pgvector</p>
              <p className="text-sm">• OAuth 2.1 security</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Agent OS Integration</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Development Workflow</CardTitle>
              <CardDescription>AI-assisted development with structured processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Planning</h4>
                  <p className="text-sm text-muted-foreground">Use @plan-product for new feature planning</p>
                </div>
                <div>
                  <h4 className="font-semibold">Analysis</h4>
                  <p className="text-sm text-muted-foreground">Use @analyze-product for code quality assessment</p>
                </div>
                <div>
                  <h4 className="font-semibold">Specification</h4>
                  <p className="text-sm text-muted-foreground">Use @create-spec for detailed specifications</p>
                </div>
                <div>
                  <h4 className="font-semibold">Execution</h4>
                  <p className="text-sm text-muted-foreground">Use @execute-tasks for implementation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Quality Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                WCAG 2.2 AA compliance with keyboard navigation and screen reader support.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fast loading times with optimized bundles and efficient rendering.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive test coverage with unit, integration, and E2E tests.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default AboutPage 