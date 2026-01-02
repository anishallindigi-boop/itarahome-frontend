import { HelpCircle, ShoppingCart, User, CreditCard, Truck, Mail } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-gray-600">
          Find answers to common questions or contact our support team.
        </p>
      </div>

      {/* Help Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Account */}
        <HelpCard
          icon={<User />}
          title="Account & Login"
          items={[
            'How to create an account',
            'Login & password issues',
            'Update profile information',
          ]}
        />

        {/* Orders */}
        <HelpCard
          icon={<ShoppingCart />}
          title="Orders & Products"
          items={[
            'How to place an order',
            'View order history',
            'Cancel or modify an order',
          ]}
        />

        {/* Payments */}
        <HelpCard
          icon={<CreditCard />}
          title="Payments & Refunds"
          items={[
            'Available payment methods',
            'Payment failed issues',
            'Refund & return policy',
          ]}
        />

        {/* Shipping */}
        <HelpCard
          icon={<Truck />}
          title="Shipping & Delivery"
          items={[
            'Delivery timelines',
            'Track your order',
            'Shipping charges',
          ]}
        />
      </div>

      {/* Contact Support */}
      <div className="mt-16 bg-gray-50 border rounded-xl p-8 text-center">
        <HelpCircle className="mx-auto mb-4 text-primary" size={36} />
        <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
        <p className="text-gray-600 mb-4">
          Our support team is here to help you.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="mailto:support@yourdomain.com"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
          >
            <Mail size={16} />
            Email Support
          </a>

          <a
            href="/contact-us"
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
          >
            Contact Form
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Reusable Card ------------------ */
function HelpCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="border rounded-xl p-6 hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>

      <ul className="space-y-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
