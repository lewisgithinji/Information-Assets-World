import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LeadForm } from '@/components/leads/LeadForm';
import { CheckCircle2, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterInterest() {
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');

  const handleSuccess = (refNumber: string) => {
    setReferenceNumber(refNumber);
    setSubmitted(true);

    // Redirect to home after 5 seconds
    setTimeout(() => {
      navigate('/');
    }, 5000);
  };

  return (
    <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <img
              src="https://informationassetsworld.com/lovable-uploads/7edae356-b2d1-4e7d-96ba-9dcadd8a7061.png"
              alt="Information Assets World Logo"
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4">
              Register Your Interest in Training
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join professionals across East Africa in enhancing their skills in Records Management,
              Information Governance, and Data Protection with Information Assets World.
            </p>
          </div>

          {/* Success State */}
          {submitted ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center space-y-6">
                <CheckCircle2 className="w-16 h-16 mx-auto text-primary" />
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">Thank you for your interest!</h2>
                  <p className="text-muted-foreground">
                    Your inquiry has been received and our team will contact you within 24 hours.
                  </p>
                </div>

                <div className="bg-background rounded-lg p-4 border">
                  <p className="text-sm text-muted-foreground mb-1">Your Reference Number</p>
                  <p className="text-xl font-mono font-bold text-primary">{referenceNumber}</p>
                </div>

                <div className="space-y-3 pt-4">
                  <p className="font-semibold">We'll contact you to discuss:</p>
                  <ul className="text-left space-y-2 max-w-md mx-auto">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Available training programs and dates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Customized solutions for your organization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Pricing and payment options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Any questions you may have</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <p className="font-semibold text-lg">Need immediate assistance?</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="tel:+254770694598" className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      <span>+254 770 694 598</span>
                    </a>
                    <a href="tel:+254721490862" className="flex items-center gap-2 text-primary hover:underline">
                      <Phone className="h-4 w-4" />
                      <span>+254 721 490 862</span>
                    </a>
                  </div>
                  <a
                    href="mailto:info@informationassetsworld.com"
                    className="flex items-center gap-2 justify-center text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    <span>info@informationassetsworld.com</span>
                  </a>
                </div>

                <div className="pt-4">
                  <Button onClick={() => navigate('/')} variant="outline">
                    Return to Homepage
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground pt-4">
                  Redirecting to homepage in 5 seconds...
                </p>
              </div>
            </div>
          ) : (
            /* Form State */
            <LeadForm onSuccess={handleSuccess} initialEventId={eventId || undefined} />
          )}

          {/* Contact Info */}
          {!submitted && (
            <div className="mt-12 text-center space-y-4">
              <div className="flex flex-wrap gap-6 justify-center text-sm">
                <a href="tel:+254770694598" className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-4 w-4" />
                  <span>+254 770 694 598</span>
                </a>
                <a href="tel:+254721490862" className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-4 w-4" />
                  <span>+254 721 490 862</span>
                </a>
                <a href="mailto:info@informationassetsworld.com" className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-4 w-4" />
                  <span>info@informationassetsworld.com</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
