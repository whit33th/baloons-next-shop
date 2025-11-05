import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative h-[calc(100svh-57px-26px-62px-20px)] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/hero-baloons.gif"
        alt="Premium Balloons Collection"
        fill
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        priority
      />
      {/* Dark overlay for text readability */}

      {/* Content */}
      <div className="text-background z-10 flex h-full max-w-2xl flex-col justify-between p-4 py-10 md:p-10">
        <div>
          <h1 className="mb-6 text-4xl leading-tight font-light sm:text-5xl md:text-6xl lg:text-7xl">
            Ballonique – When Moments Become Emotions
          </h1>
        </div>
        <div>
          <p className="mb-8 hidden text-xl md:block md:text-2xl">
            Designer balloon sets for all celebrations. Emotions and joy in
            every detail.
          </p>
          <Link
            href="/catalog"
            className="btn-accent inline-flex items-center gap-3 rounded-full px-6 py-3 text-lg font-medium transition-[transform,opacity] duration-200 hover:opacity-90"
          >
            Shop Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
