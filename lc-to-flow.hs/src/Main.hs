module Main where

import Data.Void
import Text.Megaparsec
import Text.Megaparsec.Char
import Data.Char (toUpper)
import Data.Bifunctor (first)
import System.IO (hPutStrLn, stderr)
import System.Environment (getArgs)
import System.Exit (exitWith, ExitCode(..))

data LambdaTerm
  = Var String
  | Abstr String LambdaTerm
  | App LambdaTerm LambdaTerm
  deriving (Show, Eq)

type Parser = Parsec Void String

ws :: Parser String
ws = many . oneOf $ " \t\r\n"

ident :: Parser String
ident = (:[]) <$> oneOf (['a'..'z'] ++ ['A'..'Z'])

var :: Parser LambdaTerm
var = Var <$> ident

abstr :: Parser LambdaTerm
abstr = do
  oneOf ['λ', '\\']
  ws
  argName <- ident
  ws
  char '.'
  ws
  Abstr argName <$> term

app :: Parser LambdaTerm
app = do
  fn <- term
  ws
  App fn <$> term

apps :: Parser LambdaTerm
apps = do
  terms <- some simpleTerm
  ws
  return $ foldl1 App terms

parens :: Parser a -> Parser a
parens p = char '(' *> ws *> p <* ws <* char ')'

simpleTerm :: Parser LambdaTerm
simpleTerm = ws *> (parens term <|> var) <* ws

term :: Parser LambdaTerm
term = ws *> (abstr <|> apps <|> simpleTerm) <* ws

parseTerm :: String -> Either String LambdaTerm
parseTerm source =
  first (\err -> "ParseError: " ++ parseErrorPretty err) $
    runParser (term <* eof) "(none)" source

genFlow :: LambdaTerm -> String
genFlow (Var name) =
  map toUpper name
genFlow (Abstr argName body) =
  let arg = map toUpper argName in
  "<" ++ arg ++ ">" ++ "(" ++ arg ++ ") => " ++ genFlow body
genFlow (App fn value) =
  "$Call<" ++ genFlow fn ++ ", " ++ genFlow value ++ ">"

exitWithMsg :: String -> IO ()
exitWithMsg msg = do
  hPutStrLn stderr msg
  exitWith (ExitFailure 1)

main :: IO ()
main = do
  args <- getArgs
  case args of
    src : _ ->
      case parseTerm src of
        Right term -> putStrLn $ genFlow term
        Left err -> exitWithMsg err
    [] -> exitWithMsg "<input-str> is empty."
