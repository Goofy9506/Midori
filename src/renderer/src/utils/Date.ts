const getSeason = (d) => Math.floor((d.getMonth() / 12) * 4) % 4
export const currentSeason = ['WINTER', 'SPRING', 'SUMMER', 'FALL'][getSeason(new Date())]
export const currentYear = new Date().getFullYear()

export const getYears = (startYear: number) => {
  const years: number[] = []
  for (let i = startYear; i < currentYear + 1; i++) {
    years.push(i)
  }
  return years
}
