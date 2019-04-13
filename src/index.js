// @flow




// ω = \x.xx
declare var ω: <X>(X) => $Call<X, X>
// Ω = ωω = (\x.xx)(\x.xx)
declare var Ω: $Call<<X>(X) => $Call<X, X>, <X>(X) => $Call<X, X>>
// declare var Ω: $Call<typeof ω, typeof ω>

// Ω = 2 // uncoment for endless loop

// S = \f.(\g.(\x.fx(gx)))
declare var S: <F>(F) => <G>(G) => <X>(X) => $Call<$Call<F, X>, $Call<G, X>>
// K = \x.\y.x
declare var K: <X>(X) => <Y>(Y) => X
// I = \x.x
declare var I: <X>(X) => X

// SKK = (\x.\y.\z.xz(yz))(\x.\y.x)(\x.\y.x) = \z.z
declare var SKK:
  $Call<$Call<<X>(X) => <Y>(Y) => <Z>(Z) => $Call<$Call<X, Z>,
    $Call<Y, Z>>, <X>(X) => <Y>(Y) => X>, <X>(X) => <Y>(Y) => X>

const _skk1: number = SKK(2)
// $ExpectError
const _skk2: string = SKK(3)

;(SKK: typeof I)

// Z = \f.(\x.f (\y.x x y)) (\x.f (\y.x x y))
declare var Z:
  <F>(F) =>
    $Call<<X>(X) => $Call<F, <Y>(Y) => $Call<$Call<X, X>, Y>>,
    <X>(X) => $Call<F, <Y>(Y) => $Call<$Call<X, X>, Y>>>

// \t. \f. t
declare var True: <T>(T) => <F>(F) => T
// \t. \f. f
declare var False: <T>(T) => <F>(F) => F
// \b. \t. \f. b t f
declare var If: <B>(B) => <X>(X) => <Y>(Y) => $Call<$Call<B, X>, Y>
// \p. \q. p q p
declare var And: <P>(P) => <Q>(Q) => $Call<$Call<P, Q>, P>
// \p. \q. p p q
declare var Or: <P>(P) => <Q>(Q) => $Call<$Call<P, P>, Q>

type TrueT = <T>(T) => <F>(F) => T
type FalseT = <T>(T) => <F>(F) => F
type AndT = <P>(P) => <Q>(Q) => $Call<$Call<P, Q>, P>

// \x. \y. \f. f x y
declare var Pair: <X>(X) => <Y>(Y) => <F>(F) => $Call<$Call<F, X>, Y>;
// \p. p (\x. \y. x)
declare var Fst: <P>(P) => $Call<P, <X>(X) => <Y>(Y) => X>
// \p. p (\x. \y. y)
declare var Snd: <P>(P) => $Call<P, <X>(X) => <Y>(Y) => Y>

// Church numerals
declare var N0: <S>(S) => <Z>(Z) => Z
declare var N1: <S>(S) => <Z>(Z) => $Call<S, Z>
declare var N2: <S>(S) => <Z>(Z) => $Call<S, $Call<S, Z>>
declare var N3: <S>(S) => <Z>(Z) => $Call<S, $Call<S, $Call<S, Z>>>
declare var N4: <S>(S) => <Z>(Z) => $Call<S, $Call<S, $Call<S, $Call<S, Z>>>>
declare var N5: <S>(S) => <Z>(Z) => $Call<S, $Call<S, $Call<S, $Call<S, $Call<S, Z>>>>>

// \n. \s. \z. s (n s z)
declare var Succ: <N>(N) => <S>(S) => <Z>(Z) => $Call<S, $Call<$Call<N, S>, Z>>

// \x. \y. \s. \z. x s (y s z)
declare var Add:
  <X>(X) => <Y>(Y) => <S>(S) => <Z>(Z) =>
    $Call<$Call<X, S>, $Call<$Call<Y, S>, Z>>

// \n. \f. \x. n (\g. \h. h (g f)) (\u. x) (\u. u)
declare var Pred:
  <N>(N) => <F>(F) => <X>(X) =>
    $Call<$Call<$Call<N, <G>(G) => <H>(H) => $Call<H, $Call<G, F>>>,
    <U>(U) => X>, <U>(U) => U>

// \m. \n. (n Pred) m
declare var Sub: <M>(M) => <N>(N) => $Call<$Call<N, typeof Pred>, M>

// \n. n (\x. False) True
declare var IsZero: <N>(N) => $Call<$Call<N, <X>(X) => typeof False>, typeof True>

// \m. \n. IsZero (Sub m n)
declare var Lte:
  <M>(M) => <N>(N) => $Call<typeof IsZero, $Call<$Call<typeof Sub, M>, N>>

// \m. \n. And (Lte m n) (Lte n m)
declare var Eq:
  <M>(M) => <N>(N) => $Call<$Call<typeof And,
    $Call<$Call<typeof Lte, M>, N>>,
    $Call<$Call<typeof Lte, N>, M>>

// declare var a5: $Call<$Call<typeof Add, typeof N2>, typeof N3>
declare var a5: $Call<typeof Succ, typeof N4>

declare var _b: $Call<$Call<typeof Lte, typeof a5>, typeof N1>
declare var _bb: $Call<$Call<typeof _b, true>, false>
var _bb0: false = _bb
// $ExpectError
var _bb1: true = _bb


// type IsZeroT = <N>(N) => $Call<$Call<N, <X>(X) => FalseT>, TrueT>

// type PredT =
//   <N>(N) => <F>(F) => <X>(X) =>
//     $Call<$Call<$Call<N, <G>(G) => <H>(H) => $Call<H, $Call<G, F>>>,
//     <U>(U) => X>, <U>(U) => U>

// type SubT = <M>(M) => <N>(N) => $Call<$Call<N, PredT>, M>

// type LteT = <M>(M) => <N>(N) => $Call<IsZeroT, $Call<$Call<SubT, M>, N>>

// // declare var _c: $Call<$Call<typeof Lte, typeof N2>, typeof a5>
// declare var _c: $Call<$Call<LteT, typeof N2>, typeof N2>
// declare var _cc: $Call<$Call<typeof _c, true>, false>
// var _cc0 = _cc
