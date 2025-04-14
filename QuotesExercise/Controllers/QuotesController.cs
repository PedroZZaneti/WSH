using TESTS09.Models;
using TESTS09.Services;
using Microsoft.AspNetCore.Mvc;



namespace TESTS09.Controllers;

[ApiController]
[Route("[controller]")]
public class QuotesController : ControllerBase{

    //http://localhost:3000/Quotes 

    //Http Action to Get all the Quotes from our service to the client 
    [HttpGet]
    public ActionResult<List<Quote>> Get() => QuoteService.GetAll();

    [HttpGet ("{id}")]

    public ActionResult<Quote> Get(int id){

        var quote = QuoteService.Get(id);

        if (quote is null) return NotFound();

        return quote;

    }

    [HttpPut ("{id}")] 
    public IActionResult Update(int id, Quote quote){
        //Check if id matches the new quote id
        if (id != quote.Id) return BadRequest();

        var existingQuote = QuoteService.Get(id);

        if (existingQuote is null) return NotFound();

        QuoteService.Update(quote);

        return NoContent();
            
        
    }

    [HttpPost]
    public IActionResult Create(Quote quote){
        QuoteService.Add(quote);

        return CreatedAtAction(nameof(Get), new{Id = quote.Id}, quote);
    }

    [HttpDelete ("{id}")]

    public IActionResult Delete(int id){
        var quote = QuoteService.Get(id);

        if (quote is null) return NotFound();

        QuoteService.Delete(id);

        return NoContent();

    }
}



