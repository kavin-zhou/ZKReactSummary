
#让我们来熟悉一下 **Redux** 里面的的几个好哥们

## &sect; Store
首先要区分 `store` 和 `state`

`state` 是应用的状态，一般本质上是一个普通**对象**  
例如，我们有一个 Web APP，包含 计数器 和 待办事项 两大功能  
那么我们可以为该应用设计出对应的存储数据结构（应用初始状态）：

```js
/** 应用初始 state **/
{
  counter: 0,
  todos: []
}
```

`store` 是应用状态 `state` 的管理者，包含下列四个函数：

* `getState()                  # 获取整个 state`
* `dispatch(action)            # ※ 触发 state 改变的【唯一途径】※`
* `subscribe(listener)         # 您可以理解成是 DOM 中的 addEventListener`
* `replaceReducer(nextReducer) # 一般在 Webpack Code-Splitting 按需加载的时候用`

二者的关系是：`state = store.getState()`

Redux 规定，一个应用只应有一个单一的 `store`，其管理着唯一的应用状态 `state`  
Redux 还规定，不能直接修改应用的状态 `state`，也就是说，下面的行为是不允许的：

```js
var state = store.getState()
state.counter = state.counter + 1 // 禁止在业务逻辑中直接修改 state
```

**若要改变 `state`，必须 `dispatch` 一个 `action`，这是修改应用状态的不二法门**  

> 现在您只需要记住 `action` 只是一个包含 **`type`** 属性的普通**对象**即可  
> 例如 `{ type: 'INCREMENT' }`

上面提到，`state` 是通过 `store.getState()` 获取，那么 `store` 又是怎么来的呢？  
想生成一个 `store`，我们需要调用 Redux 的 `createStore`：

```js
import { createStore } from 'redux'
...
const store = createStore(reducer, initialState) // store 是靠传入 reducer 生成的哦！
```  
> 现在您只需要记住 `reducer` 是一个 **函数**，负责**更新**并返回一个**新的** `state`  
> 而 `initialState` 主要用于前后端同构的数据同步（详情请关注 React 服务端渲染）   

## &sect; Action
上面提到，`action`（动作）实质上是包含 `type` 属性的普通对象，这个 `type` 是我们实现用户行为追踪的关键  
例如，增加一个待办事项 的 `action` 可能是像下面一样：

```js
{
  type: 'ADD_TODO',
  payload: {
    id: 1,
    content: '待办事项1',
    completed: false
  }
}
```

当然，`action` 的形式是多种多样的，唯一的约束仅仅就是包含一个 `type` 属性罢了  
也就是说，下面这些 `action` 都是合法的：

```js
/** 如下都是合法的，但就是不够规范 **/
{
  type: 'ADD_TODO',
  id: 1,
  content: '待办事项1',
  completed: false
}

{
  type: 'ADD_TODO',
  abcdefg: {
    id: 1,
    content: '待办事项1',
    completed: false
  }
}
```

> 虽说没有约束，但最好还是遵循 [规范](https://github.com/acdlite/flux-standard-action)

如果需要新增一个代办事项，实际上就是将 `code-2` 中的 `payload` **“写入”** 到 `state.todos` 数组中（如何“写入”？在此留个悬念）：  

```js
{
  counter: 0,
  todos: [{
    id: 1,
    content: '待办事项1',
    completed: false
  }]
}
```

刨根问底，`action` 是谁生成的呢？

### ⊙ Action Creator
> Action Creator 可以是同步的，也可以是异步的

顾名思义，Action Creator 是 `action` 的创造者，本质上就是一个**函数**，返回值是一个 `action`（**对象**）  
例如下面就是一个 “新增一个待办事项” 的 Action Creator：

```js
var id = 1
function addTodo(content) {
  return {
    type: 'ADD_TODO',
    payload: {
      id: id++,
      content: content, // 待办事项内容
      completed: false  // 是否完成的标识
    }
  }
}
```

将该函数应用到一个表单（假设 `store` 为全局变量，并引入了 jQuery ）：

```html
<input type="text" id="todoInput" />
<button id="btn">提交</button>

<script>
$('#btn').on('click', function() {
  var content = $('#todoInput').val() // 获取输入框的值
  var action = addTodo(content) // 执行 Action Creator 获得 action
  store.dispatch(action) // 改变 state 的不二法门：dispatch 一个 action！！！
})
</script>
```

在输入框中输入 “待办事项2” 后，点击一下提交按钮，我们的 `state` 就变成了：

```js
/** 本代码块记为 code-6 **/
{
  counter: 0,
  todos: [{
    id: 1,
    content: '待办事项1',
    completed: false
  }, {
    id: 2,
    content: '待办事项2',
    completed: false
  }]
}
```

> 通俗点讲，Action Creator 用于绑定到用户的操作（点击按钮等），其返回值 `action` 用于之后的 `dispatch(action)`

刚刚提到过，`action` 明明就没有强制的规范，为什么 `store.dispatch(action)` 之后，  
Redux 会明确知道是提取 `action.payload`，并且是对应写入到 `state.todos` 数组中？  
又是谁负责“写入”的呢？悬念即将揭晓...

## &sect; Reducer
> Reducer 必须是同步的纯函数  

用户每次 `dispatch(action)` 后，都会触发 `reducer`  的执行  
`reducer` 的实质是一个**函数**，根据 `action.type` 来**更新** `state` 并返回 `nextState`  
最后会用 `reducer` 的返回值 `nextState` **完全替换掉**原来的 `state`

> 注意：上面的这个 “更新” 并不是指 `reducer` 可以直接对 `state` 进行修改  
> Redux 规定，须先复制一份 `state`，在副本 `nextState` 上进行修改操作  
> 例如，可以使用 lodash 的 `cloneDeep`，也可以使用 `Object.assign / map / filter/ ...` 等返回副本的函数

在上面 Action Creator 中提到的 待办事项的 `reducer` 大概是长这个样子 (为了容易理解，在此不使用 ES6 / [Immutable.js][immutable])：

```js
var initState = {
  counter: 0,
  todos: []
}

function reducer(state, action) {
  // ※ 应用的初始状态是在第一次执行 reducer 时设置的 ※
  if (!state) state = initState
  
  switch (action.type) {
    case 'ADD_TODO':
      var nextState = _.cloneDeep(state) // 用到了 lodash 的深克隆
      nextState.todos.push(action.payload) 
      return nextState

    default:
    // 由于 nextState 会把原 state 整个替换掉
    // 若无修改，必须返回原 state（否则就是 undefined）
      return state
  }
}
```

> 通俗点讲，就是 `reducer` 返回啥，`state` 就被替换成啥

## &sect; 总结

* `store` 由 Redux 的 `createStore(reducer)` 生成
* `state` 通过 `store.getState()` 获取，本质上一般是一个存储着整个应用状态的**对象**
* `action` 本质上是一个包含 `type` 属性的普通**对象**，由 Action Creator (**函数**) 产生
* 改变 `state` 必须 `dispatch` 一个 `action`
* `reducer` 本质上是根据 `action.type` 来更新 `state` 并返回 `nextState` 的**函数**
* `reducer` 必须返回值，否则 `nextState` 即为 `undefined`
* 实际上，**`state` 就是所有 `reducer` 返回值的汇总**（本教程只有一个 `reducer`，主要是应用场景比较简单）

> Action Creator => `action` => `store.dispatch(action)` => `reducer(state, action)` => ~~`原 state`~~ `state = nextState`

### ⊙ Redux 与传统后端 MVC 的对照
Redux | 传统后端 MVC
---|---
`store` | 数据库实例
`state` | 数据库中存储的数据
`dispatch(action)` | 用户发起请求
`action: { type, payload }` | `type` 表示请求的 URL，`payload` 表示请求的数据
`reducer` | 路由 + 控制器（handler）
`reducer` 中的 `switch-case` 分支 | 路由，根据 `action.type` 路由到对应的控制器
`reducer` 内部对 `state` 的处理 | 控制器对数据库进行增删改操作
`reducer` 返回 `nextState` | 将修改后的记录写回数据库

## &sect; 最简单的例子
直接看打印台, [传送门](./simple-redux.html)

> 由上可知，Redux 并不一定要搭配 React 使用。Redux 纯粹只是一个状态管理库，几乎可以搭配任何框架使用  
> （上述例子连 jQuery 都没用哦亲）

###为了更好地理解Redux, 摘自知乎的 [Wang Namelos](https://www.zhihu.com/question/41312576) 的回答 

问: 理解 React，但不理解 Redux，该如何通俗易懂的理解 Redux？

解答这个问题并不困难：唯一的要求是你熟悉React。
不要光听别人描述名词，理解起来是很困难的。
从需求出发，看看使用React需要什么：
1. React有props和state: props意味着父级分发下来的属性，state意味着组件内部可以自行管理的状态，并且整个React没有数据向上回溯的能力，也就是说数据只能单向向下分发，或者自行内部消化。
理解这个是理解React和Redux的前提。
2. 一般构建的React组件内部可能是一个完整的应用，它自己工作良好，你可以通过属性作为API控制它。但是更多的时候发现React根本无法让两个组件互相交流，使用对方的数据。
然后这时候不通过DOM沟通（也就是React体制内）解决的唯一办法就是提升state，将state放到共有的父组件中来管理，再作为props分发回子组件。
3. 子组件改变父组件state的办法只能是通过onClick触发父组件声明好的回调，也就是父组件提前声明好函数或方法作为契约描述自己的state将如何变化，再将它同样作为属性交给子组件使用。
这样就出现了一个模式：数据总是单向从顶层向下分发的，但是只有子组件回调在概念上可以回到state顶层影响数据。这样state一定程度上是响应式的。
4. 为了面临所有可能的扩展问题，最容易想到的办法就是把所有state集中放到所有组件顶层，然后分发给所有组件。
5. 为了有更好的state管理，就需要一个库来作为更专业的顶层state分发给所有React应用，这就是Redux。让我们回来看看重现上面结构的需求：
a. 需要回调通知state (等同于回调参数) -> action
b. 需要根据回调处理 (等同于父级方法) -> reducer
c. 需要state (等同于总状态) -> store
对Redux来说只有这三个要素：
a. action是纯声明式的数据结构，只提供事件的所有要素，不提供逻辑。
b. reducer是一个匹配函数，action的发送是全局的：所有的reducer都可以捕捉到并匹配与自己相关与否，相关就拿走action中的要素进行逻辑处理，修改store中的状态，不相关就不对state做处理原样返回。
c. store负责存储状态并可以被react api回调，发布action.
当然一般不会直接把两个库拿来用，还有一个binding叫react-redux, 提供一个Provider和connect。很多人其实看懂了redux卡在这里。
a. Provider是一个普通组件，可以作为顶层app的分发点，它只需要store属性就可以了。它会将state分发给所有被connect的组件，不管它在哪里，被嵌套多少层。
b. connect是真正的重点，它是一个科里化函数，意思是先接受两个参数（数据绑定mapStateToProps和事件绑定mapDispatchToProps），再接受一个参数（将要绑定的组件本身）：
mapStateToProps：构建好Redux系统的时候，它会被自动初始化，但是你的React组件并不知道它的存在，因此你需要分拣出你需要的Redux状态，所以你需要绑定一个函数，它的参数是state，简单返回你关心的几个值。
mapDispatchToProps：声明好的action作为回调，也可以被注入到组件里，就是通过这个函数，它的参数是dispatch，通过redux的辅助方法bindActionCreator绑定所有action以及参数的dispatch，就可以作为属性在组件里面作为函数简单使用了，不需要手动dispatch。这个mapDispatchToProps是可选的，如果不传这个参数redux会简单把dispatch作为属性注入给组件，可以手动当做store.dispatch使用。这也是为什么要科里化的原因。

做好以上流程Redux和React就可以工作了。简单地说就是：
1.顶层分发状态，让React组件被动地渲染。
2.监听事件，事件有权利回到所有状态顶层影响状态。

[this-github]: https://github.com/kenberkeley/redux-simple-tutorial
[advanced-tutorial]: https://github.com/kenberkeley/redux-simple-tutorial/blob/master/redux-advanced-tutorial.md
[react-demo]: https://github.com/kenberkeley/react-demo
[flux]: https://github.com/facebook/flux
[reflux]: https://github.com/reflux/refluxjs
[mobx]: https://github.com/mobxjs/mobx
[redux]: https://github.com/reactjs/redux
[flux-action-pattern]: https://github.com/acdlite/flux-standard-action
[global-err-handler]: http://stackoverflow.com/questions/5328154/#5328206
[redux-devtools]: https://github.com/gaearon/redux-devtools
[immutable]: https://github.com/facebook/immutable-js
[jsbin]: http://jsbin.com/zivare/edit?html,console
