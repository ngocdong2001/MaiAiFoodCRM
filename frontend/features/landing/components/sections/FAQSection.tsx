"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";
import { useInView } from "@/shared/hooks/useInView";
import { useTranslation } from "react-i18next";

import Container from "../layouts/Container";

type FAQSectionProps = {
  className?: string;
  id?: string;
};

const FAQSection = ({ className, id }: FAQSectionProps) => {
  const { t } = useTranslation();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  const faqs = [
    {
      question: t("faq.items.0.question"),
      answer: t("faq.items.0.answer"),
    },
    {
      question: t("faq.items.1.question"),
      answer: t("faq.items.1.answer"),
    },
    {
      question: t("faq.items.2.question"),
      answer: t("faq.items.2.answer"),
    },
    {
      question: t("faq.items.3.question"),
      answer: t("faq.items.3.answer"),
    },
  ];

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "relative py-16 sm:py-20 lg:py-24 transition-all duration-1000",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-pretty text-base leading-6 text-muted-foreground sm:mt-4">
            {t("faq.description")}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl lg:mt-16">
          <Accordion multiple defaultValue={["item-0", "item-1"]}>
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
};

export default FAQSection;
