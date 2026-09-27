// *****************************************************************
//  モナド
// *****************************************************************

// ------------------------------------------------------------
//  汎用ユーティリティ: 自動カリー化関数 (Currying)
// ------------------------------------------------------------
export function curry(fn: (...args: any[]) => any) {
    return function curried(...args: any[]): any {
        if (args.length >= fn.length) {
            return fn(...args);
        }
        return function(...nextArgs: any[]) {
            return curried(...args.concat(nextArgs));
        };
    };
}

// ------------------------------------------------------------
//  Maybe モナド (Null/Undefined 対策の箱)
// ------------------------------------------------------------
export class Maybe<T> {
    private readonly _value: T | null | undefined;

    constructor(value: T | null | undefined) {
        this._value = value;
    }

    public static of<U>(value: U | null | undefined): Maybe<U> {
        return new Maybe<U>(value);
    }

    public isNothing(): boolean {
        return this._value === null || this._value === undefined;
    }

    public map<U>(fn: (value: T) => U): Maybe<U> {
        return this.isNothing() ? Maybe.of<U>(null) : Maybe.of<U>(fn(this._value!));
    }

    public flatMap<U>(fn: (value: T) => Maybe<U>): Maybe<U> {
        return this.isNothing() ? Maybe.of<U>(null) : fn(this._value!);
    }

    // 💡 Applicative: 関数の箱(this)に値の箱(maybeValue)をドッキング
    public ap<U>(maybeValue: Maybe<T>): Maybe<U> {
        if (this.isNothing() || maybeValue.isNothing()) {
            return Maybe.of<U>(null);
        }
        const fn = this._value as any; // 内部の関数
        return Maybe.of<U>(fn(maybeValue._value));
    }

    public getOrElse(defaultValue: T): T {
        return this.isNothing() ? defaultValue : this._value!;
    }
}

// ------------------------------------------------------------
//  Either モナド (エラー理由を追跡・保持できる箱)
// ------------------------------------------------------------
export type Either<E, A> = Left<E, A> | Right<E, A>;

export class Left<E, A> {
    readonly tag = 'Left' as const;
    constructor(readonly error: E) {}

    public map<B>(fn: (value: A) => B): Either<E, B> { return this as any; }
    public flatMap<B>(fn: (value: A) => Either<E, B>): Either<E, B> { return this as any; }
    
    // 💡 Applicative: 自分がすでにエラーなら、相手に関わらずエラーを引き継ぐ
    public ap<B>(eitherValue: Either<E, A>): Either<E, B> { return this as any; }

    public fold<B>(onLeft: (error: E) => B, onRight: (value: A) => B): B {
        return onLeft(this.error);
    }
}

export class Right<E, A> {
    readonly tag = 'Right' as const;

    // constructorの引数にreadonlyがあるので、以下のように書いているのと同じ意味になる．
    constructor(readonly value: A) {}
    // readonly value: A;
    // constructor(value: A) { this.value = value; }

    public map<B>(fn: (value: A) => B): Either<E, B> { return new Right(fn(this.value)); }
    public flatMap<B>(fn: (value: A) => Either<E, B>): Either<E, B> { return fn(this.value); }

    // 💡 Applicative: 自分が関数を持っている場合、相手の箱の中身を適用する
    public ap<B>(eitherValue: Either<E, A>): Either<E, B> {
        if (eitherValue.tag === 'Left') return eitherValue as any;
        const fn = this.value as any; // 内部の関数
        return new Right(fn(eitherValue.value));
    }

    public fold<B>(onLeft: (error: E) => B, onRight: (value: A) => B): B {
        return onRight(this.value);
    }
}

// ------------------------------------------------------------
//  IO モナド (不確実な処理・副作用を遅延させる箱)
// ------------------------------------------------------------
export class IO<T> {
    private readonly _effect: () => T;

    constructor(effect: () => T) {
        this._effect = effect;
    }

    public static of<U>(value: U): IO<U> {
        return new IO<U>(() => value);
    }

    public map<U>(fn: (value: T) => U): IO<U> {
        return new IO<U>(() => fn(this._effect()));
    }

    public flatMap<U>(fn: (value: T) => IO<U>): IO<U> {
        return new IO<U>(() => fn(this._effect()).run());
    }

    // 💡 Applicative: 処理（関数を生成する処理と、値を生成する処理）をドッキング
    // ※run()が呼ばれるまで、中の_effectは一切実行されません
    public ap<U>(ioValue: IO<T>): IO<U> {
        return new IO<U>(() => {
            const fn = this._effect() as any; // 自身の効果（関数）を評価
            const value = ioValue.run();       // 相手の効果（値）を評価
            return fn(value);
        });
    }

    public run(): T {
        return this._effect();
    }
}
