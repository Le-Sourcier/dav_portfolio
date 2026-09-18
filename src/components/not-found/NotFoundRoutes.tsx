import Link from "next/link";
import { notFoundDestinations } from "@/lib/notFound";

export function NotFoundRoutes() {
  return (
    <section className="section notfound-routes" aria-labelledby="notfound-routes-title">
      <div className="section-heading">
        <p className="section-kicker">Reprendre la navigation</p>
        <h2 id="notfound-routes-title">Où souhaitez-vous aller ?</h2>
        <p>
          Chaque section du site reste accessible en un clic. Choisissez la destination la plus proche de ce
          que vous cherchiez.
        </p>
      </div>

      <div className="notfound-route-grid">
        {notFoundDestinations.map((destination) => (
          <Link className="notfound-route-card" href={destination.href} key={destination.href}>
            <span>{destination.index}</span>
            <strong>{destination.title}</strong>
            <p>{destination.description}</p>
            <em>{destination.action}</em>
          </Link>
        ))}
      </div>
    </section>
  );
}
