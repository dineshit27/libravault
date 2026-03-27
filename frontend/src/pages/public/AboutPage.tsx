import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Users,
  Award,
  Heart,
  Clock,
  Globe,
  Accessibility,
  Leaf,
  Newspaper,
  Briefcase,
  Lightbulb,
  Handshake,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ScrollStack, { ScrollStackItem } from '../../components/ui/ScrollStack';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About — LibraVault Public Library</title>
        <meta name="description" content="Learn about LibraVault Public Library — our mission, history, and commitment to serving the community." />
      </Helmet>

      <section className="bg-brutal-blue noise-overlay py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="yellow" size="md" className="mb-4">About Us</Badge>
          <h1 className="font-heading font-bold text-4xl sm:text-6xl uppercase text-white mb-4">LibraVault Public Library</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">Serving our community with knowledge, inspiration, and connection since 1952. Over 50,000 titles across every genre.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <Badge variant="green" size="md" className="mb-3">Our Story</Badge>
          <h2 className="font-heading font-bold text-3xl uppercase mb-4">From One Room to a Regional Knowledge Hub</h2>
          <p className="text-brutal-dark-gray leading-relaxed">
            LibraVault began in 1952 with a volunteer-led reading room and a few shelves of donated books.
            Over seven decades, it evolved into a city-wide system with neighborhood branches, digital lending,
            youth literacy programs, and partnerships with schools and community centers.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading font-bold text-3xl uppercase mb-4">Our Mission</h2>
            <p className="text-brutal-dark-gray leading-relaxed mb-4">LibraVault exists to democratize access to knowledge. We believe every person, regardless of background, deserves free access to books, digital resources, and educational programs that can transform their lives.</p>
            <p className="text-brutal-dark-gray leading-relaxed">Founded in 1952, we have grown from a single-room collection of 500 books to a modern library system serving over 18,000 active members with a catalog spanning more than 50,000 titles in 30 languages.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="border-3 border-brutal-black shadow-brutal-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop" alt="LibraVault interior" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>

        <section className="mb-16">
          <Badge variant="coral" size="md" className="mb-3">Our Vision</Badge>
          <Card color="white" padding="lg">
            <p className="font-heading font-bold uppercase text-xl mb-2">
              Build the most inclusive, data-informed public library network in the region by 2030.
            </p>
            <p className="text-sm text-brutal-dark-gray">
              Over the next 5 to 10 years, we are investing in digital-first borrowing, multilingual collections,
              neighborhood micro-libraries, and AI-assisted discovery so every learner can access knowledge wherever they are.
            </p>
          </Card>
        </section>

        <section className="mb-16">
          <Badge variant="yellow" size="md" className="mb-3">Our Values</Badge>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'Accessibility', icon: Accessibility },
              { title: 'Community', icon: Users },
              { title: 'Knowledge', icon: BookOpen },
              { title: 'Inclusion', icon: Handshake },
              { title: 'Innovation', icon: Lightbulb },
            ].map((value) => (
              <Card key={value.title} color="yellow" padding="md" className="text-center">
                <value.icon size={24} className="mx-auto mb-2" />
                <p className="font-heading font-bold uppercase text-sm">{value.title}</p>
              </Card>
            ))}
          </div>
        </section>

        <div className="mb-16">
          <ScrollStack>
          {[
            { icon: BookOpen, title: '52,847 Books', desc: 'Across fiction, non-fiction, academic, and children\'s literature', color: 'yellow' as const },
            { icon: Users, title: '18,234 Members', desc: 'Active readers and lifelong learners in our community', color: 'green' as const },
            { icon: Award, title: '72 Years', desc: 'Of continuous service to the Springfield community', color: 'coral' as const },
            { icon: Heart, title: '200+ Programs', desc: 'Annual events including author talks, workshops, and reading groups', color: 'blue' as const },
            { icon: Clock, title: '7 Days/Week', desc: 'Open every day with extended evening hours on weekdays', color: 'yellow' as const },
            { icon: Globe, title: '30 Languages', desc: 'Multilingual collection serving our diverse community', color: 'green' as const },
          ].map((item, i) => (
            <ScrollStackItem key={i}>
              <Card color={item.color} padding="lg" className="h-full">
                <item.icon size={32} className="mb-3" />
                <h3 className="font-heading font-bold text-xl uppercase mb-2">{item.title}</h3>
                <p className="text-sm opacity-80">{item.desc}</p>
              </Card>
            </ScrollStackItem>
          ))}
          </ScrollStack>
        </div>

        <section className="mb-16">
          <Badge variant="blue" size="md" className="mb-3">Our Leadership</Badge>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'Elena Hart', title: 'Executive Director', note: 'Expanded LibraVault to 42 cities with equity-focused outreach.' },
              { name: 'Marcus Lee', title: 'Founder & Chair', note: 'Champion of open access policy and digital literacy investment.' },
            ].map((leader) => (
              <Card key={leader.name} color="white" padding="lg">
                <p className="font-heading font-bold text-2xl uppercase">{leader.name}</p>
                <p className="font-heading font-bold uppercase text-brutal-blue mt-1">{leader.title}</p>
                <p className="text-sm text-brutal-dark-gray mt-3">{leader.note}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <Badge variant="green" size="md" className="mb-3">Our History</Badge>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="absolute left-4 top-0 h-full w-1 origin-top bg-brutal-black"
            />

            <div className="space-y-5">
              {[
                { year: '1952', text: 'Founded as a neighborhood reading room.' },
                { year: '1978', text: 'Opened first dedicated children\'s library wing.' },
                { year: '2004', text: 'Launched city-wide mobile lending vans.' },
                { year: '2018', text: 'Introduced e-books and audiobooks platform.' },
                { year: '2025', text: 'Reached 50,000+ active catalog titles.' },
              ].map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: 36 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  className="relative pl-14"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.1 + 0.12 }}
                    viewport={{ once: true }}
                    className="absolute left-[7px] top-4 z-10 h-5 w-5 border-3 border-brutal-black bg-brutal-green"
                  >
                    <motion.span
                      className="absolute inset-[-6px] border-2 border-brutal-black/40"
                      animate={{ scale: [1, 1.45, 1], opacity: [0.45, 0.1, 0.45] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
                    />
                  </motion.div>

                  <Card color="white" padding="md" className="transition-transform duration-300 hover:-translate-y-1" hoverable={false}>
                    <p className="font-heading font-bold uppercase text-sm">{milestone.year}</p>
                    <p className="text-sm text-brutal-dark-gray mt-1">{milestone.text}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mb-16">
          <Badge variant="coral" size="md" className="mb-3">Community Impact</Badge>
          <Card color="white" padding="lg">
            <p className="text-sm text-brutal-dark-gray">
              In the last 12 months, LibraVault supported 14,000 student visits, facilitated 320 literacy mentoring sessions,
              and delivered 8,500 books to seniors and mobility-limited members.
            </p>
          </Card>
        </section>

        <section className="mb-16">
          <Badge variant="yellow" size="md" className="mb-3">Partners & Sponsors</Badge>
          <div className="relative overflow-hidden border-3 border-brutal-black bg-brutal-yellow p-4 sm:p-5 shadow-brutal">
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-brutal-yellow to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-brutal-yellow to-transparent" />

            <div className="flex w-max gap-4 animate-marquee pause-animation-on-hover py-1">
              {[
                { name: 'City Council', icon: Globe },
                { name: 'ReadForward Foundation', icon: BookOpen },
                { name: 'Tamil Nadu Literacy Mission', icon: Newspaper },
                { name: 'Chennai Education Trust', icon: Lightbulb },
                { name: 'Bright Books Collective', icon: Award },
                { name: 'Youth Trust Network', icon: Heart },
                { name: 'Community Learning Hub', icon: Users },
                { name: 'Public Archive Society', icon: Handshake },
              ].concat([
                { name: 'City Council', icon: Globe },
                { name: 'ReadForward Foundation', icon: BookOpen },
                { name: 'Tamil Nadu Literacy Mission', icon: Newspaper },
                { name: 'Chennai Education Trust', icon: Lightbulb },
                { name: 'Bright Books Collective', icon: Award },
                { name: 'Youth Trust Network', icon: Heart },
                { name: 'Community Learning Hub', icon: Users },
                { name: 'Public Archive Society', icon: Handshake },
              ]).map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="shrink-0 min-w-[220px] bg-brutal-white border-3 border-brutal-black px-4 py-3 shadow-brutal-sm"
                >
                  <div className="flex items-center justify-center gap-2">
                    <partner.icon size={16} />
                    <p className="font-heading font-bold uppercase text-xs tracking-wide text-center">{partner.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <Badge variant="green" size="md" className="mb-3">Awards & Recognition</Badge>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['National Literacy Excellence 2023', 'Inclusive Public Service Badge', 'Digital Access Innovation Award'].map((award) => (
              <Card key={award} color="yellow" padding="md">
                <Award size={20} className="mb-2" />
                <p className="font-heading font-bold uppercase text-sm">{award}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          <Card color="blue" padding="lg" className="text-white">
            <div className="flex items-center gap-2 mb-3">
              <Accessibility size={20} />
              <h3 className="font-heading font-bold uppercase">Accessibility Commitment</h3>
            </div>
            <p className="text-sm text-white/90">
              We design inclusive physical and digital experiences with wheelchair access, screen-reader support,
              high-contrast interfaces, and multilingual navigation assistance.
            </p>
          </Card>
          <Card color="green" padding="lg">
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={20} />
              <h3 className="font-heading font-bold uppercase">Sustainability Pledge</h3>
            </div>
            <p className="text-sm text-brutal-dark-gray">
              LibraVault prioritizes recycled print materials, LED-first branches, and a digital-first lending strategy
              to reduce waste and operational emissions.
            </p>
          </Card>
        </section>

        <section>
          <Card color="coral" padding="lg" className="text-white">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={20} />
              <h3 className="font-heading font-bold uppercase text-xl">Join Our Team</h3>
            </div>
            <p className="text-sm text-white/90 mb-4">
              We are hiring librarians, program coordinators, and digital support volunteers. Help us build the future of equitable access.
            </p>
            <a href="/contact" className="inline-block border-3 border-white px-4 py-2 font-heading font-bold uppercase">View Open Roles & Volunteer</a>
          </Card>
        </section>
      </div>
    </>
  );
}
