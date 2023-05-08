enum EnumGameStatus {
  PREPARE, PROCESSING
}

enum EnumPlaygroundStatus {
  EDITABLE, READY
}

enum EnumPlaygroundEditStatus {
  ALL_READY,
  ONLY_SECOND_NOT_READY,
  ONLY_FIRST_NOT_READY,
  ALL_NOT_READY,
  SECOND_NOT_CONNECTED,
  ERROR_WITH_FIRST,
}

enum EnumShipStatus {
  NOT_DAMAGED, DESTROYED
}

enum EnumShotStatus {
  HIT, PAST
}

export { 
  EnumPlaygroundStatus,
  EnumPlaygroundEditStatus,
  EnumGameStatus,
  EnumShipStatus,
  EnumShotStatus
}