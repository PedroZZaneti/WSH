using System.Security.Cryptography.X509Certificates;
using TESTS09.Controllers;
using TESTS09.Models;

namespace TESTS09.Services;

public class QuoteService{


    //each and every quote added will be given an available id
    static int availableId = 2;

    //temporary database --cache (Não Guarda na memoria)

    static List<Quote> QuotesDB;

    //this class must not be instatieated anymore
    static QuoteService(){
        //pulate the database with some small data

        QuotesDB = new List<Quote>(){

            new Quote{ 
                Id = 0 , 
                author = "PedroZaneti",
                quote = "Vai dar certo"
                },
            new Quote{ 
                Id = 1 , 
                author = "Dezan",
                quote = "Isso ai é facil"
                },
        };
    }



    //gets all the quotes
    public static List<Quote> GetAll() => QuotesDB;

    //get a single quote by id
    public static Quote? Get(int id) => 
    QuotesDB.FirstOrDefault( quote => quote.Id ==id);


    //update an exist quote

    public static void Update(Quote quote){
        var index = QuotesDB.FindIndex(q => q.Id == quote.Id);

        if(index == -1) return;

        QuotesDB[index] = quote;
    }

    //Create a new quote

    public static void Add(Quote quote){
        quote.Id = availableId;
        availableId++;
        QuotesDB.Add(quote);


    }

    //Delete a Quote by id

    public static void Delete(int id){
        var quote = Get(id);

        if( quote is null) return;

        QuotesDB.Remove(quote); 

    }

    //Delete all Quotes

    //Tentar fazer depois

}