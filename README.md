# type-support
### Get typeguards and casting for free
```javascript
import { t, getHelpers } from 'type-support'

const user = {
  username: t.string,
  age: t.number,
  info: {
    address: t.string,
    pets: t.array(t.string)
  }
}
type User = typeof user
const [isUser, castToUser] = getHelpers<User>(user)
```
