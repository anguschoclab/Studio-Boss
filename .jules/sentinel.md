## 2024-05-24 - Add maxLength to Textarea
**Vulnerability:** Textarea components lacked a default `maxLength`, exposing the app to DoS via excessive resource consumption during re-renders on extremely long strings.
**Learning:** Always provide a reasonable default maximum length for text input components (like `<Input>` and `<Textarea>`) bound to React state.
**Prevention:** Ensure new input and textarea components explicitly declare a `maxLength` property.
