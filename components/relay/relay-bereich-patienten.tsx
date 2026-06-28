"use client";

import Link from "next/link";

import type { RelayPatientItem } from "@/lib/relay/relay-bereich-model";

import { RelayV2EmptyState } from "./relay-side-nav";

type Props = {
  items: RelayPatientItem[];
};

export function RelayBereichPatienten({ items }: Props) {
  if (items.length === 0) {
    return <RelayV2EmptyState title="Keine Patientenanfragen" hint="Eingehende Patientenanfragen werden hier priorisiert." />;
  }

  return (
    <div className="relay-mod-patienten">
      <table className="relay-mod-patienten__table">
        <thead>
          <tr>
            <th scope="col">Patient</th>
            <th scope="col">Anliegen</th>
            <th scope="col">Wartet</th>
            <th scope="col" className="sr-only">
              Aktion
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="relay-mod-patienten__name">{item.patientName}</td>
              <td className="relay-mod-patienten__concern">{item.concern}</td>
              <td className="relay-mod-patienten__wait">
                {item.waitingLabel}
                {item.dateLabel ? ` · ${item.dateLabel}` : ""}
              </td>
              <td className="relay-mod-patienten__action">
                <Link href={item.href}>Öffnen →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
