// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCYAkG-cy6Fo4h-OfwYT2LlJilxE-ZQH6Q",
    authDomain: "firestore-investigation.firebaseapp.com",
    databaseURL: "https://firestore-investigation.firebaseio.com",
    projectId: "firestore-investigation",
    storageBucket: "firestore-investigation.appspot.com",
    messagingSenderId: "511833879245"
  }
};
