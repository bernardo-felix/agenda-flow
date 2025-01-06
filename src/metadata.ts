/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./modules/people/dto/register.dto"), { "RegisterDto": { email: { required: true, type: () => String, format: "email" }, password: { required: true, type: () => String }, name: { required: true, type: () => String } } }], [import("./modules/auth/dto/signIn.dto"), { "SignInDto": { email: { required: true, type: () => String, format: "email" }, password: { required: true, type: () => String } } }], [import("./modules/auth/dto/response/signIn.dto"), { "SignInResponse": { token: { required: true, type: () => String }, refreshToken: { required: true, type: () => String } } }], [import("./modules/auth/dto/refresh.dto"), { "RefreshDto": { refreshToken: { required: true, type: () => String } } }]], "controllers": [[import("./modules/people/controllers/register.controller"), { "RegisterController": { "register": {} } }], [import("./modules/auth/controllers/signIn.controller"), { "SignInController": { "signIn": { summary: "Create a new cat", description: "This operation allows you to create a new cat." } } }], [import("./modules/auth/controllers/refresh.controller"), { "RefreshController": { "refresh": {} } }]] } };
};