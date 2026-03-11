import type { DocSection } from './types.js'

function row(img: string, name: string, cost: string, maint: string, power: string, jobs: string, pop: string, pollution: string, notes: string): string {
  return `<tr>
    <td class="docs-ref-sprite"><img src="${img}" alt="${name}"></td>
    <td><strong>${name}</strong></td>
    <td>${cost}</td>
    <td>${maint}</td>
    <td>${power}</td>
    <td>${jobs}</td>
    <td>${pop}</td>
    <td>${pollution}</td>
    <td>${notes}</td>
  </tr>`
}

export const buildingReference: DocSection = {
  title: 'Building Reference',
  content: `
    <table class="docs-ref-table">
      <tr>
        <th></th>
        <th>Building</th>
        <th>Cost</th>
        <th>Maint.</th>
        <th>Power</th>
        <th>Jobs</th>
        <th>Pop.</th>
        <th>Pollution</th>
        <th>Notes</th>
      </tr>
      ${row('/tiles/buildings/residential-small.svg', 'Residential', 'Free', '—', 'Required', '—', '10', '—', 'Develops on zones')}
      ${row('/tiles/buildings/commercial-small.svg', 'Commercial', 'Free', '—', 'Required', '5', '—', '—', 'Needs population')}
      ${row('/tiles/buildings/industrial-small.svg', 'Industrial', 'Free', '—', 'Required', '10', '—', 'R3, Amt 10', 'Steady demand')}
      ${row('/tiles/buildings/residential-medium.svg', 'Residential (Med)', 'Free', '—', 'Required', '—', '100–120', '—', 'Needs paved road + pop 500')}
      ${row('/tiles/buildings/residential-high.svg', 'Residential (High)', 'Free', '—', 'Required', '—', '330', '—', 'Needs transit stop')}
      ${row('/tiles/buildings/commercial-medium.svg', 'Commercial (Med)', 'Free', '—', 'Required', '30–36', '—', '—', 'Needs paved road')}
      ${row('/tiles/buildings/commercial-high.svg', 'Commercial (High)', 'Free', '—', 'Required', '175–200', '—', '—', 'Needs transit stop')}
      ${row('/tiles/buildings/industrial-medium.svg', 'Industrial (Med)', 'Free', '—', 'Required', '~10', '—', 'R4, Amt 20', 'More tax, same jobs')}
      ${row('/tiles/buildings/industrial-high.svg', 'Industrial (High)', 'Free', '—', 'Required', '5–6', '—', 'R6, Amt 40', 'Automated: high tax, few jobs')}
      ${row('/tiles/buildings/transit-stop.svg', 'Transit Stop', '$500', '$50/mo', 'Required', '—', '—', '—', 'Anchors high density in 10-tile radius')}
      ${row('/tiles/power/diesel-generator.svg', 'Diesel Generator', '$300', '$15/mo', 'Gen. 50', '—', '—', 'R2, Amt 5', 'Early game')}
      ${row('/tiles/power/power-plant-coal.svg', 'Coal Plant', '$2,000', '$60/mo', 'Gen. 700', '—', '—', 'R6, Amt 20', 'Mid-game')}
      ${row('/tiles/power/power-plant-nuclear.svg', 'Nuclear Plant', '$5,000', '$100/mo', 'Gen. 2,000', '—', '—', 'None', 'Most efficient')}
      ${row('/tiles/buildings/service/police-station.svg', 'Police Station', '$300', '$50/mo', 'Required', '—', '—', '—', '15-tile crime radius')}
      ${row('/tiles/buildings/service/fire-station.svg', 'Fire Station', '$300', '$50/mo', 'Required', '—', '—', '—', '15-tile fire radius')}
      ${row('/tiles/buildings/park.svg', 'Park', '$10', '—', '—', '—', '—', '—', 'Boosts land value')}
    </table>
  `,
}
