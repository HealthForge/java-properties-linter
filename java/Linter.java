import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.*;
import static java.nio.file.FileVisitResult.*;
import static java.nio.file.FileVisitOption.*;
import java.util.*;



class Linter {
    // https://docs.oracle.com/javase/tutorial/essential/io/find.html
    public static class Finder
            extends SimpleFileVisitor<Path> {

        private final PathMatcher matcher;
        private int numMatches = 0;

        Finder(String pattern) {
            matcher = FileSystems.getDefault()
                    .getPathMatcher("glob:" + pattern);
        }

        // Compares the glob pattern against
        // the file or directory name.
        void find(Path file) {
            Path name = file.getFileName();
            if (name != null && matcher.matches(name)) {
                numMatches++;
                System.out.println(file);

                loadProperties(file);

            }
        }

        void loadProperties(Path file) {
            Properties prop = new Properties();
            InputStream input = null;

            try {

                input = new FileInputStream(file.toString());

                // load a properties file
                prop.load(input);

                // get the property value and print it out
                System.out.println(prop.keySet().size() + " keys");
                for(Object key : prop.keySet()) {
                    System.out.print("   '");
                    System.out.print(key);
                    System.out.print("'");
                    System.out.println();
                }
                System.out.println();
                System.out.println();

            } catch (Exception ex) {
                ex.printStackTrace();
            } finally {
                if (input != null) {
                    try {
                        input.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }

        // Prints the total number of
        // matches to standard out.
        void done() {
            System.out.println("Matched: "
                    + numMatches);
        }

        // Invoke the pattern matching
        // method on each file.
        @Override
        public FileVisitResult visitFile(Path file,
                                         BasicFileAttributes attrs) {
            find(file);
            return CONTINUE;
        }

        // Invoke the pattern matching
        // method on each directory.
        @Override
        public FileVisitResult preVisitDirectory(Path dir,
                                                 BasicFileAttributes attrs) {
            find(dir);
            return CONTINUE;
        }

        @Override
        public FileVisitResult visitFileFailed(Path file,
                                               IOException exc) {
            System.err.println(exc);
            return CONTINUE;
        }
    }


    public static void main(String[] args) {
        System.out.println("Hello World!");

        try {
            Path startingDir = Paths.get(args[0]);
            String pattern = "*.properties";

            Finder finder = new Finder(pattern);
            Files.walkFileTree(startingDir, finder);
            finder.done();
        } catch(Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}