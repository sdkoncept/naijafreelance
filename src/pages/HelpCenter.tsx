import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, MessageSquare, FileText, CreditCard, User, Briefcase, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const faqCategories = [
  {
    title: "Getting Started",
    icon: User,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click on 'Sign Up' in the top right corner, fill in your details, and verify your email address. You can choose to sign up as a client or freelancer."
      },
      {
        q: "What's the difference between a client and freelancer account?",
        a: "Clients post jobs and hire freelancers. Freelancers create gigs and offer their services. You can switch between roles, but you'll need to complete your profile for each."
      },
      {
        q: "How do I complete my profile?",
        a: "Go to your Profile page and fill in your information, upload a profile picture, and add a bio. For freelancers, you can also add your skills and portfolio."
      }
    ]
  },
  {
    title: "For Clients",
    icon: Briefcase,
    questions: [
      {
        q: "How do I find a freelancer?",
        a: "Browse our marketplace using the search and filter options. You can search by skill, price range, or rating. View freelancer profiles and portfolios before making a decision."
      },
      {
        q: "How do I place an order?",
        a: "Once you find a freelancer you like, click on their gig, choose a package, and click 'Order Now'. Fill in your requirements and proceed to payment."
      },
      {
        q: "How does payment work?",
        a: "Payment is held securely in escrow until the work is completed and you approve it. You can pay using various payment methods including Paystack."
      },
      {
        q: "What if I'm not satisfied with the work?",
        a: "You can request revisions or contact our support team if there's a dispute. We have a dispute resolution process to ensure fair outcomes."
      }
    ]
  },
  {
    title: "For Freelancers",
    icon: User,
    questions: [
      {
        q: "How do I create a gig?",
        a: "Go to your Freelancer Dashboard and click 'Create Gig'. Fill in your service details, set up packages with pricing, and add your portfolio samples."
      },
      {
        q: "How do I get paid?",
        a: "Once you complete the work and the client approves it, payment is released to your account. You can then withdraw your earnings to your bank account."
      },
      {
        q: "What are the platform fees?",
        a: "We charge a 20% commission on completed orders. This covers payment processing, platform maintenance, and customer support."
      },
      {
        q: "How do I build my reputation?",
        a: "Deliver quality work on time, communicate clearly with clients, and encourage satisfied clients to leave reviews. Good reviews help you get more orders."
      }
    ]
  },
  {
    title: "Payments & Billing",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods are accepted?",
        a: "We accept payments through Paystack, which supports debit cards, credit cards, and bank transfers."
      },
      {
        q: "When is payment released to freelancers?",
        a: "Payment is released once the client marks the order as completed and approves the work. This typically happens after delivery and review."
      },
      {
        q: "Are there any fees?",
        a: "Clients pay the listed price. Freelancers receive 80% of the order value after our 20% commission. There are no hidden fees."
      },
      {
        q: "How do I withdraw my earnings?",
        a: "Go to your Earnings page, enter your bank account details, and request a withdrawal. Processing typically takes 3-5 business days."
      }
    ]
  },
  {
    title: "Safety & Security",
    icon: Shield,
    questions: [
      {
        q: "Is my payment information secure?",
        a: "Yes, all payments are processed through secure, PCI-compliant payment gateways. We never store your full payment details."
      },
      {
        q: "What if someone tries to take communication off-platform?",
        a: "We monitor messages for attempts to move communication off-platform. Violations may result in warnings or account restrictions. Always keep communication on NaijaFreelance."
      },
      {
        q: "How do I report a problem?",
        a: "Contact our support team through the Contact Us page or use the report feature on any user profile or message."
      }
    ]
  }
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa => 
        qa.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qa.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions or contact our support team
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600 mb-4">Get help from our support team</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold mb-2">How It Works</h3>
              <p className="text-sm text-gray-600 mb-4">Learn about our platform</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/how-it-works">View Guide</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <h3 className="font-semibold mb-2">Safety & Security</h3>
              <p className="text-sm text-gray-600 mb-4">Learn about our safety measures</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/privacy">Privacy Policy</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredFAQs.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <Card key={categoryIndex}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-slate-700" />
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.questions.map((qa, qaIndex) => {
                    const questionId = categoryIndex * 100 + qaIndex;
                    const isExpanded = expandedQuestion === questionId;
                    return (
                      <div key={qaIndex} className="border-b last:border-0 pb-4 last:pb-0">
                        <button
                          onClick={() => setExpandedQuestion(isExpanded ? null : questionId)}
                          className="w-full text-left flex items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <HelpCircle className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                            <h3 className="font-semibold">{qa.q}</h3>
                          </div>
                          <span className="text-slate-500 flex-shrink-0">
                            {isExpanded ? "−" : "+"}
                          </span>
                        </button>
                        {isExpanded && (
                          <p className="mt-3 ml-8 text-gray-600 text-sm">{qa.a}</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Still Need Help */}
        {filteredFAQs.length === 0 && searchTerm && (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try different keywords or contact our support team for assistance.
              </p>
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact CTA */}
        <Card className="mt-12 bg-slate-50">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-700" />
            <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to assist you. Get in touch and we'll respond as soon as possible.
            </p>
            <Button asChild size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

