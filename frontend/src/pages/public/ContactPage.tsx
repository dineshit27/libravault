import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  AlertTriangle,
  Lightbulb,
  Star,
  Clock3,
  Building2,
  MessagesSquare,
  Globe,
  MessageCircle,
  Monitor,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(2, 'Please select a subject'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactForm = z.infer<typeof schema>;

type ContactHoverCardProps = {
  title: string;
  value: string;
  note?: string;
  href?: string;
  icon: LucideIcon;
};

function ContactHoverCard({ title, value, note, href = '#', icon: Icon }: ContactHoverCardProps) {
  return (
    <a
      href={href}
      className="w-full p-5 border-3 border-brutal-black relative overflow-hidden group bg-brutal-yellow shadow-brutal-sm block"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brutal-coral to-brutal-blue translate-y-[102%] group-hover:translate-y-[0%] transition-transform duration-300" />

      <Icon className="absolute z-10 -top-10 -right-10 text-[100px] text-black/10 group-hover:text-white/20 group-hover:rotate-12 transition-all duration-300" />

      <div className="relative z-10">
        <Icon className="mb-3 text-2xl text-brutal-black group-hover:text-white transition-colors duration-300" />
        <p className="font-heading font-bold uppercase text-2xl sm:text-xl text-brutal-black group-hover:text-white transition-colors duration-300">
          {title}
        </p>
        <p className="text-xl sm:text-lg whitespace-pre-line text-brutal-black group-hover:text-white transition-colors duration-300">
          {value}
        </p>
        {note ? (
          <p className="text-lg sm:text-base mt-1 text-brutal-dark-gray group-hover:text-white/90 transition-colors duration-300 whitespace-pre-line">
            {note}
          </p>
        ) : null}
      </div>
    </a>
  );
}

type HeroStatProps = {
  label: string;
  value: number;
  suffix?: string;
};

function HeroStat({ label, value, suffix = '' }: HeroStatProps) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animationFrame = 0;
    let startTime: number | null = null;
    const duration = 1200;

    const tick = (time: number) => {
      if (startTime === null) startTime = time;

      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animationFrame = requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return (
    <div ref={containerRef} className="border-3 border-brutal-black bg-white px-4 py-3 shadow-brutal-sm min-w-[140px]">
      <p className="font-heading font-bold text-3xl leading-none text-brutal-black">
        {count}
        {suffix}
      </p>
      <p className="font-heading text-xs uppercase tracking-wide mt-1 text-brutal-dark-gray">{label}</p>
    </div>
  );
}

export default function ContactPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactForm>({
    resolver: zodResolver(schema),
    defaultValues: { subject: 'general' },
  });

  const onSubmit = async (data: ContactForm) => {
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`Message sent: ${data.subject}`);
    reset();
  };

  return (
    <>
      <Helmet>
        <title>Contact — LibraVault</title>
        <meta name="description" content="Get in touch with LibraVault Public Library. Contact us for questions, feedback, or membership inquiries." />
      </Helmet>

      <section className="bg-brutal-coral noise-overlay py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="black" size="md" className="mb-4">Get in Touch</Badge>
          <h1 className="font-heading font-bold text-4xl sm:text-6xl uppercase text-white mb-4">Let's Talk.</h1>
          <p className="text-white/80 text-lg mb-6">Questions, feedback, issues, or collaboration ideas. We are ready.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <HeroStat label="Avg. Reply" value={24} suffix="h" />
            <HeroStat label="Support Tickets / Month" value={1200} suffix="+" />
            <HeroStat label="Satisfaction Score" value={98} suffix="%" />
          </div>
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <Button variant="secondary" icon={<MessagesSquare size={18} />}>
              Start a Conversation
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Phone, title: 'Call Us', value: '(+91) 81221 23456', note: 'Mon-Sat, 8 AM - 8 PM', href: 'tel:+918122123456' },
              { icon: Mail, title: 'Email Us', value: 'libravault@gmail.com', note: 'We reply within 24 hours', href: 'mailto:libravault@gmail.com' },
              { icon: Building2, title: 'Visit Us', value: 'Nanganullur, Chennai - 88', note: 'Tamil Nadu, India', href: '#' },
            ].map((item) => (
              <ContactHoverCard
                key={item.title}
                title={item.title}
                value={item.value}
                note={item.note}
                href={item.href}
                icon={item.icon}
              />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {[
              { icon: Mail, title: 'Email', value: 'libravault@gmail.com', href: 'mailto:libravault@gmail.com' },
              { icon: Phone, title: 'Phone', value: '(+91) 81221 23456', href: 'tel:+918122123456' },
              { icon: MapPin, title: 'Visit Us', value: 'Thillai Ganga Nagar\nNanganullur, Chennai - 88\nTamil Nadu, India', href: '#' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <ContactHoverCard
                  title={item.title}
                  value={item.value}
                  href={item.href}
                  icon={item.icon}
                />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card color="white" padding="lg" hoverable={false}>
              <h2 className="font-heading font-bold text-2xl uppercase mb-6 border-b-3 border-brutal-black pb-3">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
                  <Input label="Email Address" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
                </div>
                <Select
                  label="Subject"
                  error={errors.subject?.message}
                  options={[
                    { value: 'general', label: 'General Inquiry' },
                    { value: 'membership', label: 'Membership' },
                    { value: 'lending', label: 'Lending / Returns' },
                    { value: 'events', label: 'Events & Programs' },
                    { value: 'support', label: 'IT Support' },
                  ]}
                  {...register('subject')}
                />
                <TextArea label="Message" placeholder="Tell us about your inquiry..." rows={5} error={errors.message?.message} {...register('message')} />
                <Button type="submit" size="lg" isLoading={isSubmitting} icon={<Send size={18} />} fullWidth>
                  Send Message
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>

        <section className="mt-12 mb-12">
          <Card color="white" padding="lg" hoverable={false}>
            <h2 className="font-heading font-bold text-2xl uppercase mb-4">Library Location Map</h2>
            <div className="border-3 border-brutal-black overflow-hidden shadow-brutal-sm">
              <iframe
                title="Library Location"
                src="https://www.google.com/maps?q=Nanganallur,+Chennai,+Tamil+Nadu&output=embed"
                className="w-full h-[320px]"
                loading="lazy"
              />
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card color="yellow" padding="lg">
              <h3 className="font-heading font-bold text-xl uppercase mb-4">Library Hours</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ['Monday', '8:00 AM - 9:00 PM'],
                  ['Tuesday', '8:00 AM - 9:00 PM'],
                  ['Wednesday', '8:00 AM - 9:00 PM'],
                  ['Thursday', '8:00 AM - 9:00 PM'],
                  ['Friday', '8:00 AM - 8:00 PM'],
                  ['Saturday', '9:00 AM - 6:00 PM'],
                  ['Sunday', '10:00 AM - 4:00 PM'],
                ].map(([day, hours]) => (
                  <>
                    <p key={`${day}-d`} className={`font-heading font-bold uppercase ${day === 'Thursday' ? 'text-brutal-coral' : ''}`}>{day}</p>
                    <p key={`${day}-h`} className={`text-right ${day === 'Thursday' ? 'font-bold' : ''}`}>{hours}</p>
                  </>
                ))}
              </div>
              <p className="text-xs mt-3 font-bold uppercase">Today highlighted in coral</p>
            </Card>

            <Card color="white" padding="lg">
              <h3 className="font-heading font-bold text-xl uppercase mb-4">Department Directory</h3>
              <div className="space-y-3 text-sm">
                <div><span className="font-bold">Membership:</span> membership@libravault.org</div>
                <div><span className="font-bold">Lending:</span> lending@libravault.org</div>
                <div><span className="font-bold">Events:</span> events@libravault.org</div>
                <div><span className="font-bold">IT Support:</span> support@libravault.org</div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <Card color="white" padding="lg">
            <h3 className="font-heading font-bold text-2xl uppercase mb-4">FAQ</h3>
            <div className="space-y-3">
              {[
                { q: 'What are your weekend hours?', a: 'Saturday 9 AM - 6 PM, Sunday 10 AM - 4 PM.' },
                { q: 'How do I borrow a book?', a: 'Browse the catalog, request online, and pick up when approved.' },
                { q: 'What if I lose my library card?', a: 'Contact membership desk; we can reissue on same day.' },
                { q: 'How are fines calculated?', a: 'Fine depends on overdue duration and book type.' },
              ].map((item, i) => (
                <div key={item.q} className="border-3 border-brutal-black">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq((prev) => (prev === i ? null : i))}
                    className="w-full text-left px-4 py-3 font-heading font-bold uppercase bg-brutal-yellow"
                  >
                    {item.q}
                  </button>
                  {expandedFaq === i && <p className="px-4 py-3 text-sm bg-white">{item.a}</p>}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card color="coral" padding="lg" className="text-white">
              <h3 className="font-heading font-bold text-xl uppercase mb-4 flex items-center gap-2">
                <AlertTriangle size={18} /> Report An Issue
              </h3>
              <div className="space-y-3">
                <Input label="Issue Type" placeholder="Damaged book / Website bug / Complaint" className="text-brutal-black" />
                <TextArea label="Details" rows={4} className="text-brutal-black" />
                <Button variant="secondary">Submit Issue</Button>
              </div>
            </Card>

            <Card color="green" padding="lg">
              <h3 className="font-heading font-bold text-xl uppercase mb-4 flex items-center gap-2">
                <Lightbulb size={18} /> Suggestion Box
              </h3>
              <div className="space-y-3">
                <Input label="Your Idea" placeholder="Book request or feature idea" />
                <TextArea label="Why this matters" rows={4} />
                <Button>Drop Suggestion</Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card color="yellow" padding="lg">
              <h3 className="font-heading font-bold uppercase mb-3">Social Media</h3>
              <div className="flex gap-3">
                <a href="#" className="p-2 border-3 border-brutal-black"><Globe size={18} /></a>
                <a href="#" className="p-2 border-3 border-brutal-black"><MessageCircle size={18} /></a>
                <a href="#" className="p-2 border-3 border-brutal-black"><Monitor size={18} /></a>
              </div>
            </Card>

            <Card color="white" padding="lg">
              <h3 className="font-heading font-bold uppercase mb-3">Emergency Contact</h3>
              <p className="text-sm">After-hours hotline: +1 (123) 555-0199</p>
              <p className="text-xs text-brutal-dark-gray mt-2">For urgent building, safety, or account lock issues.</p>
            </Card>

            <Card color="blue" padding="lg" className="text-white">
              <h3 className="font-heading font-bold uppercase mb-3">Response Time Promise</h3>
              <p className="text-sm">We reply to all standard inquiries within 24 hours.</p>
              <div className="flex items-center gap-2 mt-3 text-white/90">
                <Clock3 size={16} />
                <span className="text-xs uppercase">Trusted support window</span>
              </div>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card color="white" padding="lg">
              <h3 className="font-heading font-bold text-xl uppercase mb-4">Feedback Survey</h3>
              <div className="space-y-3">
                <Input label="How satisfied are you today?" placeholder="Short answer" />
                <div>
                  <p className="font-heading font-bold text-sm uppercase mb-2">Rate us</p>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} type="button" className="p-1 border-2 border-brutal-black">
                        <Star size={16} />
                      </button>
                    ))}
                  </div>
                </div>
                <TextArea label="Any comments?" rows={3} />
              </div>
            </Card>

            <Card color="green" padding="lg">
              <h3 className="font-heading font-bold text-xl uppercase mb-4">Newsletter Opt-in</h3>
              <p className="text-sm mb-3">Stay updated on new arrivals and events without sending a full message.</p>
              <div className="flex gap-2">
                <Input placeholder="you@example.com" />
                <Button>Subscribe</Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
