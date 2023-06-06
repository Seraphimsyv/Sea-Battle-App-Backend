export type AuthData = {
  login: string,
  password: string
};

export type RegisterData = AuthData & {
  username: string
}