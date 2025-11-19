-- Sample Blog Posts for Testing
-- Run this in Supabase SQL Editor

-- Insert sample blog posts
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image_url,
  category_id,
  tags,
  status,
  published_date,
  featured,
  view_count
) VALUES
-- Post 1: Company News - Featured
(
  'Welcome to Information Assets World Blog',
  'welcome-to-information-assets-world-blog',
  'We''re excited to launch our new blog platform to share insights, updates, and expert analysis on information security and compliance.',
  '<h2>Welcome to Our Blog!</h2><p>We''re thrilled to announce the launch of our new blog platform. This is your go-to resource for:</p><ul><li><strong>Industry Insights:</strong> Stay updated with the latest trends in information security</li><li><strong>Event Updates:</strong> Get highlights and recaps from our training events</li><li><strong>Best Practices:</strong> Learn from expert guides and tutorials</li><li><strong>Case Studies:</strong> Real-world success stories from the field</li></ul><p>Our team of experts will be regularly sharing valuable content to help you navigate the complex world of information security and compliance. Subscribe to stay updated!</p><h3>What to Expect</h3><p>In the coming weeks, we''ll be covering topics including:</p><ol><li>Zero Trust Security implementation</li><li>Data privacy regulations update</li><li>Cloud security best practices</li><li>Incident response strategies</li></ol><p>Thank you for joining us on this journey. We look forward to sharing valuable insights with you!</p>',
  NULL,
  (SELECT id FROM public.blog_categories WHERE slug = 'company-news' LIMIT 1),
  ARRAY['welcome', 'announcement', 'blog-launch'],
  'published',
  NOW(),
  true,
  127
),

-- Post 2: Industry Insights - Featured
(
  'Top 5 Cybersecurity Trends to Watch in 2025',
  'cybersecurity-trends-2025',
  'As we move into 2025, the cybersecurity landscape continues to evolve. Here are the five most important trends that security professionals need to be aware of.',
  '<h2>The Future of Cybersecurity is Here</h2><p>The threat landscape is constantly evolving, and staying ahead requires awareness of emerging trends. Here are the top 5 cybersecurity trends shaping 2025:</p><h3>1. AI-Powered Threat Detection</h3><p>Artificial intelligence and machine learning are revolutionizing how organizations detect and respond to threats. Advanced AI systems can now identify anomalies and potential breaches in real-time, significantly reducing response times.</p><h3>2. Zero Trust Architecture Becomes Standard</h3><p>The traditional perimeter-based security model is becoming obsolete. Zero Trust Architecture, which assumes no user or device should be trusted by default, is rapidly becoming the industry standard.</p><h3>3. Cloud-Native Security</h3><p>As more organizations move to cloud infrastructure, security must be built into cloud-native applications from the ground up. This includes container security, serverless security, and cloud access security brokers (CASBs).</p><h3>4. Privacy-First Approach</h3><p>With increasing regulations like GDPR and CCPA, organizations are adopting privacy-by-design principles. Data minimization and user consent are becoming central to security strategies.</p><h3>5. Quantum-Resistant Cryptography</h3><p>As quantum computing advances, organizations are beginning to implement quantum-resistant encryption algorithms to protect against future threats.</p><blockquote>The key to success in 2025 is not just implementing these technologies, but creating a security culture that embraces continuous learning and adaptation.</blockquote><p>Stay ahead of these trends by attending our upcoming training sessions!</p>',
  NULL,
  (SELECT id FROM public.blog_categories WHERE slug = 'industry-insights' LIMIT 1),
  ARRAY['cybersecurity', 'trends', '2025', 'ai', 'zero-trust'],
  'published',
  NOW() - INTERVAL '2 days',
  true,
  243
),

-- Post 3: Best Practices
(
  'How to Implement Zero Trust Security in Your Organization',
  'implement-zero-trust-security',
  'Zero Trust security is no longer optional. Learn how to implement this critical security framework in your organization with our comprehensive step-by-step guide.',
  '<h2>Understanding Zero Trust</h2><p>Zero Trust is a security framework that requires all users, whether inside or outside the organization''s network, to be authenticated, authorized, and continuously validated before being granted access to applications and data.</p><h3>Core Principles of Zero Trust</h3><ul><li><strong>Never Trust, Always Verify:</strong> Every access request must be verified regardless of origin</li><li><strong>Least Privilege Access:</strong> Users only get access to what they need</li><li><strong>Assume Breach:</strong> Design systems assuming attackers are already inside</li></ul><h3>Implementation Steps</h3><h4>Step 1: Identify Your Protected Surface</h4><p>Start by identifying your most critical data, assets, applications, and services (DAAS). Focus on protecting these first rather than trying to protect everything at once.</p><h4>Step 2: Map Transaction Flows</h4><p>Understand how traffic moves across your network. Document who needs access to what, when, and why.</p><h4>Step 3: Build Your Zero Trust Architecture</h4><p>Design micro-perimeters around your protected surface. Implement:</p><ul><li>Multi-factor authentication (MFA)</li><li>Network segmentation</li><li>Real-time monitoring and analytics</li><li>Automated threat response</li></ul><h4>Step 4: Create Zero Trust Policy</h4><p>Develop comprehensive policies that define access controls based on the principle of least privilege.</p><h4>Step 5: Monitor and Maintain</h4><p>Continuously monitor all traffic and maintain logs for analysis. Use AI and machine learning to detect anomalies.</p><h3>Common Challenges</h3><p>Organizations often face challenges including:</p><ul><li>Legacy systems compatibility</li><li>User experience concerns</li><li>Implementation complexity</li><li>Cost considerations</li></ul><p>However, the benefits far outweigh these challenges. Organizations that implement Zero Trust see significant reductions in breach impact and faster threat detection.</p><p><strong>Want to learn more?</strong> Join our upcoming Zero Trust Security workshop!</p>',
  NULL,
  (SELECT id FROM public.blog_categories WHERE slug = 'best-practices' LIMIT 1),
  ARRAY['zero-trust', 'security', 'implementation', 'best-practices', 'guide'],
  'published',
  NOW() - INTERVAL '5 days',
  false,
  189
),

-- Post 4: Event Updates
(
  'Highlights from Our Recent ISO 27001 Training in Nairobi',
  'iso-27001-training-nairobi-highlights',
  'Our recent ISO 27001 training session in Nairobi was a resounding success. Here are the key highlights and insights from the event.',
  '<h2>An Incredible Learning Experience</h2><p>Last week, we concluded our comprehensive ISO 27001 Lead Implementer training in Nairobi, Kenya. The event brought together over 50 information security professionals from across East Africa.</p><h3>Key Takeaways</h3><p>Participants gained in-depth knowledge about:</p><ul><li>Understanding the ISO 27001 standard and its requirements</li><li>Implementing an Information Security Management System (ISMS)</li><li>Conducting risk assessments and treatment</li><li>Preparing for certification audits</li><li>Maintaining and continually improving the ISMS</li></ul><h3>Participant Feedback</h3><blockquote>"This training exceeded my expectations. The practical examples and hands-on exercises made complex concepts easy to understand." - Mary K., IT Manager</blockquote><blockquote>"The instructor''s real-world experience added tremendous value. I''m now confident in leading our ISO 27001 implementation project." - John M., Security Consultant</blockquote><h3>Networking Opportunities</h3><p>Beyond the formal training, participants appreciated the networking opportunities. Many formed valuable connections that will support their professional growth and organizational initiatives.</p><h3>What''s Next?</h3><p>Due to popular demand, we''re scheduling another session in Nairobi in March 2025. We''re also expanding to new locations including Kampala, Dar es Salaam, and Kigali.</p><p><strong>Interested in attending?</strong> Check out our upcoming events and register early to secure your spot!</p>',
  NULL,
  (SELECT id FROM public.blog_categories WHERE slug = 'event-updates' LIMIT 1),
  ARRAY['iso-27001', 'training', 'nairobi', 'event', 'highlights'],
  'published',
  NOW() - INTERVAL '1 day',
  false,
  156
),

-- Post 5: Case Study
(
  'Case Study: How ABC Corporation Achieved ISO 27001 Certification in 6 Months',
  'abc-corporation-iso-27001-case-study',
  'Discover how ABC Corporation, a leading financial services firm, successfully implemented an ISMS and achieved ISO 27001 certification in just six months.',
  '<h2>The Challenge</h2><p>ABC Corporation, a mid-sized financial services firm with 200 employees, needed to achieve ISO 27001 certification to meet regulatory requirements and client expectations. They faced several challenges:</p><ul><li>Limited internal security expertise</li><li>Legacy systems and processes</li><li>Tight 6-month deadline</li><li>Budget constraints</li></ul><h3>The Approach</h3><h4>Phase 1: Gap Analysis (Month 1)</h4><p>We conducted a comprehensive gap analysis to identify current security posture versus ISO 27001 requirements. This revealed 47 major gaps that needed addressing.</p><h4>Phase 2: Policy Development (Months 1-2)</h4><p>We worked with ABC''s team to develop comprehensive security policies covering all aspects of ISO 27001, including:</p><ul><li>Information Security Policy</li><li>Access Control Policy</li><li>Incident Response Procedures</li><li>Business Continuity Plans</li></ul><h4>Phase 3: Implementation (Months 2-4)</h4><p>The implementation phase focused on:</p><ul><li>Technical controls deployment</li><li>Process implementation</li><li>Staff training and awareness</li><li>Documentation and record keeping</li></ul><h4>Phase 4: Internal Audit (Month 5)</h4><p>We conducted thorough internal audits to ensure all controls were functioning effectively and documentation was complete.</p><h4>Phase 5: Certification Audit (Month 6)</h4><p>ABC successfully passed their certification audit with zero major non-conformities.</p><h3>Results</h3><p>The implementation delivered significant benefits:</p><ul><li>✅ Achieved ISO 27001 certification on schedule</li><li>✅ Enhanced security posture across the organization</li><li>✅ Improved client confidence and trust</li><li>✅ Met regulatory compliance requirements</li><li>✅ Established framework for continuous improvement</li></ul><h3>Key Success Factors</h3><ol><li><strong>Executive Support:</strong> Strong backing from leadership ensured resource availability</li><li><strong>Cross-Functional Team:</strong> Representatives from all departments ensured buy-in</li><li><strong>Expert Guidance:</strong> Our consultants provided crucial expertise and direction</li><li><strong>Pragmatic Approach:</strong> Focused on practical, effective controls rather than excessive documentation</li></ol><blockquote>"Working with Information Assets World made the difference. Their expertise and practical approach helped us achieve what seemed impossible." - CTO, ABC Corporation</blockquote><h3>Lessons Learned</h3><p>Key lessons from this project:</p><ul><li>Early stakeholder engagement is critical</li><li>Document as you go, don''t leave it to the end</li><li>Focus on risk-based approach</li><li>Invest in staff training and awareness</li></ul><p><strong>Ready to start your ISO 27001 journey?</strong> Contact us to discuss how we can help your organization achieve certification!</p>',
  NULL,
  (SELECT id FROM public.blog_categories WHERE slug = 'case-studies' LIMIT 1),
  ARRAY['case-study', 'iso-27001', 'certification', 'success-story', 'implementation'],
  'published',
  NOW() - INTERVAL '7 days',
  true,
  312
),

-- Post 6: Industry Insights
(
  'Understanding the New EU Cyber Resilience Act',
  'eu-cyber-resilience-act-explained',
  'The EU Cyber Resilience Act will significantly impact product security requirements. Here''s what organizations need to know and how to prepare.',
  '<h2>What is the Cyber Resilience Act?</h2><p>The EU Cyber Resilience Act (CRA) is new legislation aimed at ensuring products with digital elements are secure throughout their lifecycle. It applies to hardware and software products placed on the EU market.</p><h3>Who Does It Affect?</h3><p>The CRA impacts:</p><ul><li>Manufacturers of products with digital elements</li><li>Importers and distributors</li><li>Online platforms</li><li>Open-source software maintainers (in some cases)</li></ul><h3>Key Requirements</h3><h4>1. Security by Design</h4><p>Products must be designed, developed, and produced to ensure security throughout their lifecycle.</p><h4>2. Vulnerability Management</h4><p>Manufacturers must:</p><ul><li>Identify and document known vulnerabilities</li><li>Provide security updates for at least 5 years</li><li>Inform users about security issues</li><li>Maintain a software bill of materials (SBOM)</li></ul><h4>3. Conformity Assessment</h4><p>Depending on the criticality, products may require third-party conformity assessment before market placement.</p><h3>Timeline</h3><ul><li><strong>2024:</strong> Act adopted and published</li><li><strong>2024-2027:</strong> Implementation period</li><li><strong>2027:</strong> Full compliance required</li></ul><h3>How to Prepare</h3><ol><li><strong>Assess Impact:</strong> Determine if your products fall under the CRA</li><li><strong>Gap Analysis:</strong> Identify current security practices versus requirements</li><li><strong>Implement Secure Development:</strong> Adopt secure SDLC practices</li><li><strong>Establish Processes:</strong> Create vulnerability management procedures</li><li><strong>Documentation:</strong> Maintain comprehensive technical documentation</li></ol><h3>Common Challenges</h3><p>Organizations may face challenges including:</p><ul><li>Legacy product portfolios</li><li>Supply chain complexity</li><li>Resource constraints</li><li>Technical debt</li></ul><h3>Benefits Beyond Compliance</h3><p>While compliance is the immediate driver, organizations benefit from:</p><ul><li>Enhanced product security</li><li>Improved customer trust</li><li>Competitive advantage</li><li>Reduced security incidents</li></ul><p><strong>Need help preparing for the CRA?</strong> Our experts can guide your compliance journey. Contact us today!</p>',
  NULL,
  (SELECT id FROM public.blog_categories WHERE slug = 'industry-insights' LIMIT 1),
  ARRAY['cyber-resilience-act', 'eu-regulation', 'compliance', 'product-security'],
  'published',
  NOW() - INTERVAL '10 days',
  false,
  198
);

-- Verify insertion
SELECT
  title,
  slug,
  status,
  featured,
  view_count,
  created_at
FROM public.blog_posts
ORDER BY created_at DESC;
