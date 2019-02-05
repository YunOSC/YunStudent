class HousingReportNotFillError extends Error {
  constructor (message) {
    super(message)
    this.name = 'HousingReportNotFillError'
  }
}

export default HousingReportNotFillError
