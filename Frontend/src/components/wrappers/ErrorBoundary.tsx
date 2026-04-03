import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // In a real app, you might want to try to recover the state or navigate to a safe route
    // window.location.reload() is a simple fallback:
    // window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-6 h-full w-full min-h-[400px]">
          <Card className="max-w-xl border-destructive/20 bg-destructive/5 nature-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive font-display text-xl">
                <AlertTriangle className="h-6 w-6" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A component crashed during rendering. The issue has been logged.
              </p>
              {this.state.error && (
                 <div className="p-4 bg-background rounded-xl border font-mono text-sm overflow-x-auto text-destructive/80">
                   {this.state.error.message}
                 </div>
              )}
              <div className="pt-4 flex gap-3">
                <Button onClick={this.handleReset} variant="outline" className="rounded-xl border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                   <RefreshCcw className="w-4 h-4 mr-2" />
                   Retry Render
                </Button>
                <Button onClick={() => window.location.reload()} className="rounded-xl">
                   Hard Reload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
