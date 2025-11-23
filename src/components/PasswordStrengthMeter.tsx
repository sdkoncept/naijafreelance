import { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (isStrong: boolean) => void;
}

export function PasswordStrengthMeter({ password, onStrengthChange }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback("");
      setSuggestions([]);
      onStrengthChange?.(false);
      return;
    }

    const result = zxcvbn(password);
    setStrength(result.score);
    setFeedback(result.feedback.warning || "");
    setSuggestions(result.feedback.suggestions || []);
    
    // Require at least score 3 (strong) for passwords
    onStrengthChange?.(result.score >= 3);
  }, [password, onStrengthChange]);

  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
      case 1:
        return "bg-destructive";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 0:
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const getStrengthIcon = () => {
    if (strength >= 3) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (strength === 2) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  // Password requirements
  const requirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(password), text: "One special character" },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength:</span>
          <div className="flex items-center gap-1">
            {getStrengthIcon()}
            <span className="font-medium">{getStrengthText()}</span>
          </div>
        </div>
        <Progress value={(strength + 1) * 20} className={getStrengthColor()} />
      </div>

      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {req.met ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.text}
            </span>
          </div>
        ))}
      </div>

      {feedback && (
        <Alert variant={strength < 3 ? "destructive" : "default"}>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              • {suggestion}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
