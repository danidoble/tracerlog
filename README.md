# TracerLog

Zero dependency library to trace the log in the console.

Trace log for javascript console
When you want to trace the log in the console, you can use this library.
For example, you can trace the log in the console like this.

```javascript
import TracerLog from "@danidoble/tracerlog";

const tracer = new TracerLog();
tracer.init();
```

Or if you want a common JS, you can do it like this.

```javascript
<script src="tracerlog.js"></script>
<script>
    const tracer = new TracerLog();
    tracer.init();
</script>
```

So you can use the console of the browser to see the log as always.

```javascript
console.log("Hello world");
```

If you want to get the current log, you can do it like this.

```javascript
tracer.data; // here are an array with the logs.
```

By default, when the limit was reached, the log will dispatch an event of browser. So you can listen this event to save
with your own code.

```javascript
document.addEventListener("console:save", function (event) {
    // here you can save the log with your own code.
});
```

But if you want only one file with the log, you can use the property save_file.

```javascript
tracer.save_file = true;
// when the limit was reached, the log will be saved in the file.
```

If you want to change the limit of logs before call to save it, you can do it like this. (by default limit is 300)

```javascript
tracer.limit = 10;
```

If you want disable the console but preserve trace

```javascript
tracer.console = false;
```

If you want save the log when you want, you can do it like this.

```javascript
tracer.saveNow();
```

When the page is unloaded, the log will be saved automatically.

```javascript
window.location.reload();
// before reload the page, the log will be saved.
```