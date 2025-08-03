# CSS Style Guide (TailwindCSS 4)

### Multi-line Utility Layout
Follow the custom multi-line convention to maximise diff clarity:

```html
<button class="btn-primary text-white
              focus:outline-none focus-visible:ring
              xs:text-sm
              sm:text-base
              md:text-lg md:px-6
              lg:text-xl lg:px-8 lg:rounded-lg
              xl:text-2xl xl:px-10
              2xl:text-3xl 2xl:px-12">
  Buy now
</button>
```

- Top line: no prefix (mobile).  
- One line per breakpoint; align vertically.  
- `hover:` & `focus:` on their own line.  
- Custom `xs` breakpoint (400 px).  

### Dark-Mode
- Use Tailwind’s **`class`** strategy; dark utilities on separate lines.

### Plugins
- `@tailwindcss/typography`, `@tailwindcss/forms`, `tailwindcss-animate`.

### Composition
- Prefer **`@apply`** in `*.css` for frequently reused patterns.
