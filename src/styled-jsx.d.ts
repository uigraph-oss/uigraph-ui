import 'react'

// styled-jsx <style jsx> / <style jsx global> attributes (previously typed by Next).
declare module 'react' {
  interface StyleHTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}
