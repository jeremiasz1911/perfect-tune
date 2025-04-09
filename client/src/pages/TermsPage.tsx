import { Helmet } from "react-helmet";
import { Link } from "wouter";

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions - MusicAcademy</title>
        <meta name="description" content="Terms and conditions for MusicAcademy services, classes, and website usage." />
      </Helmet>

      <section className="bg-neutral-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-accent text-4xl font-bold mb-4 text-center">Terms and Conditions</h1>
          <p className="text-neutral-300 max-w-2xl mx-auto text-center">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg">
              <h2>1. Introduction</h2>
              <p>
                Welcome to MusicAcademy. These Terms and Conditions govern your use of our website, mobile applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
              </p>
              
              <h2>2. Definitions</h2>
              <p>
                Throughout these Terms, "we," "us," and "our" refer to MusicAcademy, and "you" and "your" refer to you, the user of our Services. "Content" refers to all materials, information, data, images, videos, and other materials provided through our Services.
              </p>
              
              <h2>3. Registration and Account Security</h2>
              <p>
                To access certain features of our Services, you may need to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
              
              <h2>4. Payment Terms</h2>
              <p>
                4.1. <strong>Fees:</strong> You agree to pay all fees associated with the Services you select. All fees are in USD unless otherwise stated and are non-refundable except as described in our Refund Policy.
              </p>
              <p>
                4.2. <strong>Billing:</strong> For subscription services, you will be billed in advance on a recurring basis, depending on the type of subscription plan you select. You authorize us to charge your designated payment method for all fees.
              </p>
              <p>
                4.3. <strong>Late Payments:</strong> If your payment is not received by the due date, your account may be suspended, and additional fees may apply.
              </p>
              
              <h2>5. Class and Workshop Policies</h2>
              <p>
                5.1. <strong>Registration:</strong> All class and workshop registrations are subject to availability and are processed on a first-come, first-served basis.
              </p>
              <p>
                5.2. <strong>Attendance:</strong> Students are expected to arrive on time for all classes and workshops. Instructors are not obligated to repeat material for late arrivals.
              </p>
              <p>
                5.3. <strong>Cancellation by MusicAcademy:</strong> We reserve the right to cancel or reschedule classes or workshops due to low enrollment, instructor illness, or other unforeseen circumstances. In such cases, participants will be notified as soon as possible and offered alternatives or refunds.
              </p>
              <p>
                5.4. <strong>Cancellation by Student:</strong> Cancellation policies vary by program and are specified at the time of registration. Generally, full refunds are provided for cancellations made at least 7 days before the scheduled class or workshop.
              </p>
              
              <h2>6. Code of Conduct</h2>
              <p>
                You agree to use our Services in compliance with all applicable laws and these Terms. You will not engage in any activity that interferes with or disrupts the Services or the servers and networks connected to the Services.
              </p>
              <p>
                During classes and workshops, you agree to behave respectfully toward instructors and other participants. Harassment, discrimination, or disruptive behavior will not be tolerated and may result in removal from the program without refund.
              </p>
              
              <h2>7. Intellectual Property</h2>
              <p>
                7.1. <strong>Our Content:</strong> All content provided through our Services, including but not limited to text, graphics, logos, images, audio, video, and software, is owned by MusicAcademy or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                7.2. <strong>Your Use:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use our Content solely for personal, non-commercial purposes related to your participation in our classes and workshops.
              </p>
              <p>
                7.3. <strong>Restrictions:</strong> You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any Content without our express written permission.
              </p>
              
              <h2>8. Privacy</h2>
              <p>
                Your privacy is important to us. Please refer to our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for information on how we collect, use, and disclose your personal information.
              </p>
              
              <h2>9. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MusicAcademy shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our Services.
              </p>
              
              <h2>10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless MusicAcademy and its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, or expenses, including reasonable attorneys' fees and costs, arising out of or in any way connected with your access to or use of our Services or your violation of these Terms.
              </p>
              
              <h2>11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or by posting a notice on our website. Your continued use of our Services after such notification constitutes your acceptance of the modified Terms.
              </p>
              
              <h2>12. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account and access to our Services at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
              
              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any dispute arising from these Terms shall be resolved exclusively in the state or federal courts located in Los Angeles County, California.
              </p>
              
              <h2>14. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                MusicAcademy<br />
                123 Music Street, Suite 101<br />
                Harmony City, CA 90210<br />
                Email: legal@musicacademy.com<br />
                Phone: (123) 456-7890
              </p>
              
              <p className="text-sm text-neutral-500">
                Last Updated: July 1, 2023
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsPage;
