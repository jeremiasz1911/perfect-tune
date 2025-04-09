import { Helmet } from "react-helmet";
import { Link } from "wouter";

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - MusicAcademy</title>
        <meta name="description" content="Privacy policy detailing how MusicAcademy collects, uses, and protects your personal information." />
      </Helmet>

      <section className="bg-neutral-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-accent text-4xl font-bold mb-4 text-center">Privacy Policy</h1>
          <p className="text-neutral-300 max-w-2xl mx-auto text-center">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg">
              <h2>1. Introduction</h2>
              <p>
                At MusicAcademy, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website, mobile applications, and services (collectively, the "Services").
              </p>
              <p>
                Please read this Privacy Policy carefully. By using our Services, you consent to the practices described in this policy.
              </p>
              
              <h2>2. Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our Services, including:
              </p>
              <h3>2.1. Personal Information</h3>
              <ul>
                <li>Contact information (such as name, email address, postal address, and phone number)</li>
                <li>Account credentials (such as username and password)</li>
                <li>Payment information (such as credit card details, billing address)</li>
                <li>Demographic information (such as age, gender)</li>
                <li>If registering children: child's name, age, and any relevant medical information</li>
                <li>Profile photos (if uploaded)</li>
              </ul>
              
              <h3>2.2. Non-Personal Information</h3>
              <ul>
                <li>Browser and device information</li>
                <li>IP address</li>
                <li>Operating system</li>
                <li>Usage data (such as pages visited, time spent on pages, links clicked)</li>
                <li>Location data (if permitted by your device settings)</li>
              </ul>
              
              <h2>3. How We Collect Information</h2>
              <p>We collect information in the following ways:</p>
              <ul>
                <li><strong>Direct Interactions:</strong> Information you provide when you register for an account, enroll in classes, make payments, contact us, or respond to surveys.</li>
                <li><strong>Automated Technologies:</strong> As you navigate through our Services, we may use cookies, web beacons, and other tracking technologies to collect information about your equipment, browsing actions, and patterns.</li>
                <li><strong>Third Parties:</strong> We may receive information about you from third parties, such as payment processors, social media platforms (if you connect your account), and other service providers.</li>
              </ul>
              
              <h2>4. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information, including confirmations and receipts</li>
                <li>Manage your account and provide customer support</li>
                <li>Communicate with you about classes, workshops, events, promotions, and other news</li>
                <li>Personalize your experience and deliver content relevant to your interests</li>
                <li>Monitor and analyze usage patterns and trends to improve our Services</li>
                <li>Detect, prevent, and address technical issues, fraud, or other illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>
              
              <h2>5. Sharing of Information</h2>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Companies that perform services on our behalf, such as payment processing, data analysis, email delivery, and hosting services.</li>
                <li><strong>Business Partners:</strong> With your consent, we may share your information with business partners to offer you certain products, services, or promotions.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or safety, or the rights, property, or safety of others.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as a business asset.</li>
              </ul>
              <p>
                We do not sell, rent, or lease your personal information to third parties without your consent.
              </p>
              
              <h2>6. Data Security</h2>
              <p>
                We have implemented appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p>
                We limit access to your personal information to those employees, agents, contractors, and other third parties who have a business need to know. They are subject to duties of confidentiality and will only process your personal information on our instructions.
              </p>
              
              <h2>7. Data Retention</h2>
              <p>
                We will retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
              <p>
                In some circumstances, we may anonymize your personal information so that it can no longer be associated with you, in which case we may use such information without further notice to you.
              </p>
              
              <h2>8. Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to object to or restrict processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent at any time, where we rely on consent to process your personal information</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the information provided in Section 12.
              </p>
              
              <h2>9. Children's Privacy</h2>
              <p>
                Our Services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn we have collected or received personal information from a child under 13 without verification of parental consent, we will delete that information.
              </p>
              <p>
                For children enrolled in our classes by their parents or legal guardians, we collect only the information necessary to provide our services and with parental consent.
              </p>
              
              <h2>10. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our Services and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Services.
              </p>
              
              <h2>11. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
              
              <h2>12. Contact Information</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                MusicAcademy<br />
                123 Music Street, Suite 101<br />
                Harmony City, CA 90210<br />
                Email: privacy@musicacademy.com<br />
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

export default PrivacyPage;
