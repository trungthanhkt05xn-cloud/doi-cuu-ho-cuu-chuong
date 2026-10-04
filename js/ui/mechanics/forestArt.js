// Shared receiver/light motif makes the cross-mission handoff visible.
import { t } from '../../i18n.js';
import { mushroom, emo } from '../art.js';
import { tween } from '../fx.js';

export function receiver(x, y, lit) {
  return `<g class="forest-receiver" pointer-events="none" data-lit="${lit}" transform="translate(${x} ${y})" role="img" aria-label="${t(lit ? 'forest.arrived' : 'forest.waiting')}"><circle r="20" fill="#203b38" stroke="#ffe98a" stroke-width="2"/><path d="M0 -12 L9 0 L0 12 L-9 0Z" fill="${lit ? '#ffe98a' : '#47665d'}"/><circle class="forest-feed" cx="-28" cy="-7" r="3" fill="#ffe98a" opacity="${lit ? 1 : 0}"/><circle class="forest-feed" cx="-37" cy="4" r="2" fill="#ffe98a" opacity="${lit ? 1 : 0}"/></g>`;
}
export function habitat(x, y, connected) {
  return `<g class="forest-habitat" pointer-events="none" data-connected="${connected}" transform="translate(${x} ${y})" role="img" aria-label="${t('forest.habitat')}">${mushroom(-12, 0, .65)}${mushroom(14, 2, .5)}<g class="forest-wildlife" opacity="${connected ? 1 : 0}">${emo(0, -23, 20, '🦋')}<circle cx="-17" cy="-8" r="3" fill="#ffe98a"/><circle cx="18" cy="-10" r="3" fill="#ffe98a"/></g></g>`;
}
export function lightTransfer(svg, path, alive, onLand) {
  const ns = 'http://www.w3.org/2000/svg';
  const beam = document.createElementNS(ns, 'path');
  beam.setAttribute('d', path); beam.setAttribute('fill', 'none');
  beam.setAttribute('stroke', '#ffe98a'); beam.setAttribute('stroke-width', '4');
  beam.setAttribute('pathLength', '100'); beam.setAttribute('stroke-dasharray', '0 100');
  beam.setAttribute('pointer-events', 'none'); svg.appendChild(beam);
  // Runs alongside the regular correct-answer payoff; never holds up the next question.
  tween(650, (e) => { if (alive()) beam.setAttribute('stroke-dasharray', `${e * 100} 100`); })
    .then(() => { beam.remove(); if (alive()) onLand(); });
}
